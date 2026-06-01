declare module "socket.io" {
  interface SocketData {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    session: {
      id: string;
      token: string;
    };
  }
}
