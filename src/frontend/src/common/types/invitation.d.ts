interface Invitation {
  id: string;
  createdAt: string;
  expiresAt: string;
  inviter: {
    name: string;
  };
  invitee: {
    email: string;
  };
}
