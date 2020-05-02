from cx_Freeze import setup, Executable
import sys, os
import requests
import tkinter

where = os.path.dirname(sys.executable)


os.environ['TCL_LIBRARY'] = where+"\\tcl\\tcl8.6"
os.environ['TK_LIBRARY'] = where+"\\tcl\\tk8.6"

__version__ = "0.1"

base = None

if sys.platform == 'win32':
    base = "Win32GUI"
    
includefiles=['VCRUNTIME140.dll',
              'pywintypes36.dll',
              'pywintypes27.dll',
              'pythoncom33.dll',
              'tcl86t.dll',
              'tk86t.dll',
              'assets'
]

packages = [
            "tkinter",
            "os",
            "time",
            "sys",
            "psutil",
            "subprocess",
            "requests",
            "json",
            "threading",
            "webbrowser",
            "pywinauto",
            "multiprocessing",
            "ctypes",
            "idna",
            "pythoncom",
            "asyncio",
            "idna.idnadata",
            ]

setup(
    name = "E.S User Management",
    description='E.S User Management',
    author='Karan Jagtiani',
    version=__version__,
    options = {"build_exe": {
    'packages': packages,
    'include_files':includefiles,
    'includes': [
            "os",
            "tkinter",
            "pywinauto.tests.allcontrols",
            "pywinauto.tests.truncation",
            "pywinauto.tests.translation",
            "pywinauto.tests.repeatedhotkey",
            "pywinauto.tests.overlapping",
            "pywinauto.tests.missingextrastring",
            "pywinauto.tests.missalignment",
            "pywinauto.tests.miscvalues",
            "pywinauto.tests.leadtrailspaces",
            "pywinauto.tests.comparetoreffont",
            "pywinauto.tests.comboboxdroppedheight",
            "pywinauto.tests.asianhotkey",
            "pywinauto.tests.allcontrols",
        ],
 
}},
executables = [Executable("main.py",base=base,icon = 'assets/favicon.ico',)]
)
