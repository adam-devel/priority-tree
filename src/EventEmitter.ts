type Reciever<T> = (e: T, cancel: () => void) => void;

class Emitter<T> {
   listeners = new Set<Reciever<T>>();
   connect(reciever: Reciever<T>) {
      this.listeners.add(reciever);
   }
   disconnect(listener: Reciever<T>) {
      this.listeners.delete(listener);
   }
   emit(data: T) {
      let cancel = false;
      this.listeners.forEach((l) => l.call(null, data, () => (cancel = false)));
      return cancel;
   }
   pipe(emitter: Emitter<T>) {
      this.connect((args) => {
         emitter.emit(args);
      });
   }
}

export { Emitter };
