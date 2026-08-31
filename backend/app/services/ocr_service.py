import os

import pytesseract
from PIL import Image
from pypdf import PdfReader
from pdf2image import convert_from_path


pytesseract.pytesseract.tesseract_cmd = (
    r"D:\\Program Files\\tesseract.exe"
)

POPPLER_PATH = (
    r"C:\\Users\\yashp\\AppData\\Local\\Microsoft\\WinGet\\Packages"
    r"\\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe"
    r"\\poppler-25.07.0\\Library\bin"
)


def extract_text_from_image(file_path: str) -> str:
    image = Image.open(file_path)

    text = pytesseract.image_to_string(
        image
    )

    return text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    # First try normal PDF text extraction
    reader = PdfReader(file_path)

    extracted_text = []

    for page in reader.pages:
        text = page.extract_text()

        if text and text.strip():
            extracted_text.append(text.strip())

    text_result = "\n".join(
        extracted_text
    ).strip()

    # PDF already contains text
    if text_result:
        return text_result

    # Scanned PDF → convert pages to images
    pages = convert_from_path(
        file_path,
        dpi=300,
        poppler_path=POPPLER_PATH
    )

    ocr_results = []

    for page_number, page_image in enumerate(
        pages,
        start=1
    ):
        text = pytesseract.image_to_string(
            page_image
        )

        if text.strip():
            ocr_results.append(
                f"--- Page {page_number} ---\n"
                f"{text.strip()}"
            )

    return "\n\n".join(
        ocr_results
    ).strip()


def extract_text(file_path: str) -> str:
    extension = os.path.splitext(
        file_path
    )[1].lower()

    if extension in {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }:
        return extract_text_from_image(
            file_path
        )

    if extension == ".pdf":
        return extract_text_from_pdf(
            file_path
        )

    raise ValueError(
        f"Unsupported file extension: {extension}"
    )