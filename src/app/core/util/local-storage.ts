

export function setLocalStorage(key: string, value: any): void {
    localStorage.setItem(key,value);
}

export function getLocalStorage(key: string, parse: boolean = false): string | null {
   return localStorage.getItem(key);
    // return encoded ? window.atob(encoded) : null;
}

export function removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
}

export function clearLocalStorage(): void {
    localStorage.clear();
}