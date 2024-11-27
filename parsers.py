import PyPDF2
from io import BytesIO
import docx
import aiohttp
import bs4
import re
import os
from playwright.async_api import async_playwright
from urllib.parse import urljoin


def clear_spaces(text):
    return re.sub(r"\s+", " ", text)


class FileParser:
    parsers = {}  # File type: parser

    @classmethod
    def register_parser(cls, parser_format, parser):
        cls.parsers[parser_format] = parser

    @classmethod
    def global_registration(cls):
        cls.register_parser("doc", cls.parse_doc)
        cls.register_parser("docx", cls.parse_doc)
        cls.register_parser("pdf", cls.parse_pdf)


    @classmethod
    def parse(cls, filename, file_data):
        file_format = filename.split('.')[-1].lower()
        parser = cls.parsers.get(file_format)
        if parser:
            return clear_spaces(parser(file_data))
        return clear_spaces(cls.parse_plain_text(file_data))

    @staticmethod
    def parse_plain_text(file_data):
        return file_data.decode(encoding='utf-8')

    @staticmethod
    def parse_pdf(file_data):
        reader = PyPDF2.PdfReader(BytesIO(file_data))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text

    @staticmethod
    def parse_doc(file_data):
        doc = docx.Document(BytesIO(file_data))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + '\n'
        return text


class UrlParser:
    MAX_MATCHES = 10
    parsers = {}  # Keyword: parser

    def __init__(self):
        self.matches = 0
        self.visited = set()

    @classmethod
    def register_parser(cls, parser_keyword, parser):
        cls.parsers[parser_keyword] = parser

    @classmethod
    def global_registration(cls):
        cls.register_parser("confluence", cls.parse_confluence_html)
        cls.register_parser("notion", cls.parse_notion)
        cls.register_parser("disk.yandex", cls.parse_yandex_disk)
        cls.register_parser("yadi.sk", cls.parse_yandex_disk)

    async def parse(self, url) -> str:
        print(url)
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                html = await response.text()
        texts = []
        for keyword in self.parsers:
            if keyword in html or keyword in url:
                return await self.parsers[keyword](url, html)
        else:
            texts.append(await self.parse_raw_html(url, html))

        soup = bs4.BeautifulSoup(html, 'html.parser')
        for tag in soup.find_all('a', href=True):
            if self.matches > self.MAX_MATCHES:
                break
            href = tag.get("href")
            if href.startswith('#'):
                continue
            try:
                cur_url = urljoin(url, href)
                if not cur_url.startswith("http"):
                    continue
                if cur_url not in self.visited:
                    self.matches += 1
                    self.visited.add(cur_url)
                    texts.append(await self.parse(cur_url))
            except Exception:
                pass
        return clear_spaces(' '.join(texts))

    @staticmethod
    async def parse_raw_html(url, html) -> str:
        soup = bs4.BeautifulSoup(html, 'html.parser')
        for tag in soup(['style', 'script', 'head', 'title', 'meta', '[document]']):
            tag.decompose()

        return soup.get_text()

    @staticmethod
    async def parse_notion(url, html) -> str:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            await page.goto(url)
            await page.wait_for_selector('div[class*="notion-page-content"]')
            content = await page.inner_text('div[class*="notion-page-content"]')
            await browser.close()
        return content

    @staticmethod
    async def parse_confluence_html(url, html) -> str:
        soup = bs4.BeautifulSoup(html, 'html.parser')
        for tag in soup(['style', 'script', 'head', 'title', 'meta', '[document]']):
            tag.decompose()
        content_div = soup.find('div', id='main-content')
        return content_div.get_text()

    @staticmethod
    async def parse_yandex_disk(url, html) -> str:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://getfile.dokpub.com/yandex/get/" + url) as response:
                filename = response.headers['Content-Disposition'].rsplit("'", 1)[-1]
                content = (await response.content.read())
                return FileParser.parse(filename, content)


FileParser.global_registration()
UrlParser.global_registration()
