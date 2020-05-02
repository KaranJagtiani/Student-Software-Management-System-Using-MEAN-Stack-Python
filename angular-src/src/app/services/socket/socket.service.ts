import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  //http://localhost:3000/users 
  private url = 'http://localhost:3000';
  private socket;


  constructor() {
    this.socket = io(this.url);
  }

  public sendMessage(message) {
    //console.log(message);
    this.socket.emit('new-message',
      {
        from: 'User',
        text: message
      },
      (back) => {//callback function here });
        console.log(back);
      });
  }

  public getMessages = () => {
    return Observable.create((observer) => {
      this.socket.on('new-message',
        (message) => {
          console.log(message);
          observer.next(message);
        });
    });
  }


  connect(): Subject<MessageEvent> {
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
    this.socket = io(this.url);

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    let observable = new Observable(observer => {
      this.socket.on('new-message', (data) => {
        console.log("Received message from Websocket Server")
        observer.next(data);
      })
      return () => {
        this.socket.disconnect();
      }
    });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    let observer = {
      next: (data: Object) => {
        this.socket.emit('new-message', JSON.stringify(data));
      },
    };

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Subject.create(observer, observable);
  }
}
