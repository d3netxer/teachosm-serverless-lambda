# -*- coding: utf-8 -*
"""
@author: Yago Hernández García
@date:   29/07/2020
"""

from pdf2docx import Converter
import os

import tkinter as tk
from tkinter import ttk
from tkinter import filedialog as fd

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Create the select file window
root = tk.Tk()
root.title('Select file window')
root.resizable(False, False)
root.geometry('150x75')

# File paths
pdf_path = ""
doc_path = r"C:\Users\war-machine\Documents\teachosm\convert_to_docx_test"

# Create the select file function associated to the button

def select_file():
    filetypes = (
        ('PDF files', '*.pdf'),
        ('All files', '*.*'))

    filename = fd.askopenfilename(
        title='Choose a file',
        initialdir='/',
        filetypes=filetypes)

    global pdf_path
    pdf_path = filename

    root.destroy()

# Create the button
open_button = ttk.Button(
    root,
    text='Open a File',
    command=select_file
)

open_button.pack(expand=True)

# Run the choose file window
root.mainloop()

try:
    # Create the .docx file with the same name
    file_name_index = pdf_path[::-1].find("/")
    docx_path = pdf_path[len(pdf_path) - file_name_index:-4] + ".docx"

    # Convert pdf to docx
    cv = Converter(pdf_path)
    cv.convert(docx_path)      # all pages by default
    cv.close()

    input("\nYour docx was created succesfully!")
    
except RuntimeError:
    os.system ("cls")
    print("Error: You closed the \"Choose file\" window before selecting a file!")
    input("\nPress enter to exit.")
