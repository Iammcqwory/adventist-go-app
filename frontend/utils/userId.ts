export function generateUserId(): string {
  // Generate a simple user ID for demo purposes
  // In a real app, this would come from authentication
  const stored = localStorage.getItem('adventist-go-user-id');
  if (stored) {
    return stored;
  }
  
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('adventist-go-user-id', userId);
  return userId;
}
