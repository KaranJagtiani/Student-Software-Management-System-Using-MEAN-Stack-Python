import datetime
import time
import psutil
import subprocess
import requests
import json
import threading
import webbrowser
import pywinauto
from tkinter import *
import socketio

appOpened = False
loggedIn = False
username = ""
password = ""
e1 = ""
e2 = ""
canvas = ""
master = ""

# Replace notepad.exe with any software you would like to manage the users of.
process_name = "notepad.exe"

# Socket Connection
sio = socketio.Client()
@sio.event
def connect():
    print('connection established')

@sio.event
def disconnect():
    print('disconnected from server')
    
sio.connect('http://localhost:3000')
user = {}

def forceCloseApp(identifier = 0):
    global loggedIn, appOpened, process_name
    while True:
        if(loggedIn == False):
            forceCloseApp.stop = 0
            si = subprocess.STARTUPINFO()
            si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            while True:
                time.sleep(5)
                if(forceCloseApp.stop == identifier):
                    break;
                try:
                    x = pywinauto.timings.wait_until_passes(1, 0.5, lambda: pywinauto.findwindows.find_windows(best_match=u'{}'.format(process_name))[0])
                    if(x and loggedIn == False):
                        subprocess.call('taskkill /F /IM {}'.format(process_name), startupinfo=si)
                except:
                    continue
        

def checkIfApplicationOpened():
    global process_name
    try:
        x = pywinauto.timings.wait_until_passes(1, 0.5, lambda: pywinauto.findwindows.find_windows(best_match=u'{}'.format(process_name))[0])
        if(x):
            return True
    except:
        return False
    

def postRequest(API_ENDPOINT, data):
    # Converting python dictionary to JSON string.
    finalData = json.dumps(data)

    # Header for the post request which expects a JSON object
    header = {"Content-type": "application/json",}

    # Post request
    r = requests.post(url = API_ENDPOINT, data = finalData, headers=header) 

    # Response sent by the server
    response = r.text

    # Converting the response back to JSON
    finalRes = json.loads(response)

    return finalRes

def onlineUser():
    global user, sio
    user['online'] = True
    
    user['loggedIn'] = True
    user['loggedOut'] = False
    
    sio.emit('new-message', user)

def offlineUser():
    global user, sio
    user['online'] = False
    
    user['loggedIn'] = False
    user['loggedOut'] = True
    
    sio.emit('new-message', user)
    

def callback():
    global username, password, process_name, e1, e2, canvas
    username = e1.get()
    password = e2.get()
  
    # If both form fields are empty.
    if((not len(username)) or (not len(password))):
        canvas.delete("username")
        canvas.delete("password")
        canvas.create_text(300, 335, text = "Fill In The Details", fill = 'red', font=('Calibri', 15), tag="empty")
        return
    
    # Put server IP address here
    API_ENDPOINT = "http://localhost:3000/users/login_gui"
    data = {
        'username': username,
        'password': password
    }
    res = postRequest(API_ENDPOINT, data)
    
    if(res['success'] == False):
        if(res['invalidUsername']):
            canvas.delete("password")
            canvas.delete("empty")
            canvas.create_text(300, 335, text = "Invalid Username", fill = 'red', font=('Calibri', 15), tag="username") 
        if(res['invalidPassword']):
            canvas.delete("username")
            canvas.delete("empty")
            canvas.create_text(300, 335, text = "Invalid Password", fill = 'red', font=('Calibri', 15), tag="password")
    else:
        name = res['name']
        forceCloseApp.stop = 1
        global appOpened, loggedIn
        appOpened = True
        loggedIn = True

        global user
        user = res['user']
        onlineUser()
        master.destroy()
        
        # After successful login, open the application.
        # Enter correct file path of application
        subprocess.call(r'C:\Windows\{}'.format(process_name))

def onRegisterClick(event):
    # Link to registration page
    url = 'http://localhost:3000/register'

    # Windows
    chrome_path = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe %s'

    # MacOS
    #chrome_path = 'open -a /Applications/Google\ Chrome.app %s'

    # Linux
    # chrome_path = '/usr/bin/google-chrome %s'

    webbrowser.get(chrome_path).open(url)

def main():
    global appOpened, loggedIn, e1, e2, canvas, master
    while True:
        if checkIfApplicationOpened():
            # Open Login GUI Page. 
            if(loggedIn == False):
                master = Tk()
                master.title('Login')
                master.geometry("600x470+400+100")
                master.iconbitmap('assets/favicon.ico')
                master.resizable(0,0)
                master.attributes("-topmost", True)
                master.overrideredirect(True)
                master.lift()
                master.focus_force()
                master.grab_set()
                master.grab_release()

                filename = PhotoImage(file = "assets/background.png")
                background_label = Label(master, text = "Test", image=filename)
                background_label.place(x=0, y=0, relwidth=1, relheight=1)

                canvas = Canvas(width=100, height=10, bd=0, highlightthickness=0)
                canvas.pack(expand=YES, fill=BOTH)
                canvas.create_image(300, 220, image=filename)
                
                canvas.create_text(300, 80, text = "Login", fill = '#ffffff', font=('Calibri', 24))
                canvas.create_text(300, 150, text = "You need to login before using this software", fill = '#ffffff', font=('Calibri', 18))

                canvas.create_text(160, 235, text = "Username", fill = '#ffffff', font=('Calibri', 18))
                canvas.create_text(160, 295, text = "Password", fill = '#ffffff', font=('Calibri', 18))
                
                e1 = Entry(canvas, font=('Calibri', 16))
                e1.focus()
                canvas.create_window(360, 235, window=e1, height=35, width=250)
                
                e2 = Entry(canvas, show="*", font=('Calibri', 16))
                canvas.create_window(360, 295, window=e2, height=35, width=250)
                
                button = Button(master, text='Submit', bg="#ff1d42", activebackground='#ff1d42', activeforeground='#ffffff', font=("Helvetica", 12, 'bold'), cursor="hand2", fg = "#ffffff", border=0, padx=60, pady=20, command=callback) 
                canvas.create_window(300, 380, window=button, height=50, width=250)

                canvas.create_text(260, 430, text = "Dont Have an Account?", fill = '#a3a3a3', font=('Calibri', 14))
                c1 = canvas.create_text(390, 430, text = "Register", fill = '#ff5500', font=('Calibri', 14, 'bold'), tag = 'registerBtn')

                canvas.tag_bind('registerBtn', '<ButtonPress-1>', onRegisterClick)

                cross = PhotoImage(file = "assets/close.png")
                crossBtn = Button(master, image=cross, bg="#e21b1b", activebackground='#e21b1b', width = 25, height = 25, command = master.destroy)
                canvas.create_window(585, 15, window=crossBtn, height=30, width=30)

                minus = PhotoImage(file = "assets/minimize.png")
                minusBtn = Button(master, image=minus, bg="#219cf3", activebackground='#219cf3', width = 25, height = 25, command = master.destroy)
                canvas.create_window(555, 15, window=minusBtn, height=30, width=30)
                
                master.mainloop() 
                
        else:
            if(appOpened):
                # Put server IP address here
                API_ENDPOINT = "http://localhost:3000/users/logout_gui"
                data = {
                    'username' : username,
                    'password' : password
                    }
                res = postRequest(API_ENDPOINT, data)
                offlineUser()
                appOpened = False
                loggedIn = False

# Execution starts from here.
t1 = threading.Thread(target=forceCloseApp, args = (1, ))      
t2 = threading.Thread(target=main)
t1.start()
t2.start()
