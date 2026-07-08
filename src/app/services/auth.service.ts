import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth;
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  private authInitializedSubject = new BehaviorSubject<boolean>(false);
  public authInitialized$: Observable<boolean> = this.authInitializedSubject.asObservable();

  constructor() {
    const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.auth = getAuth(app);

    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
      this.authInitializedSubject.next(true);
    });
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
