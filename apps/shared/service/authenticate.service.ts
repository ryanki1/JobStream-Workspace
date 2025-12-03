export class AuthenticateService {
    public isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }
}