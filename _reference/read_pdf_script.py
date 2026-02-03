import pypdf
import os

pdf_path = "MOCK INTERVIEW.pdf"
output_path = "pdf_text_utf8.txt"

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} not found.")
    exit(1)

try:
    reader = pypdf.PdfReader(pdf_path)
    print(f"Number of pages: {len(reader.pages)}")
    
    with open(output_path, "w", encoding="utf-8") as f:
        for i, page in enumerate(reader.pages):
            f.write(f"--- Page {i+1} ---\n")
            text = page.extract_text()
            f.write(text + "\n")
            print(f"Page {i+1} extracted.")
            
    print(f"Text saved to {output_path}")

except Exception as e:
    print(f"Error reading PDF: {e}")
