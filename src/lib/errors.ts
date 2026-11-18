export function translateStrapiError(message: string): string {
  if (!message) return 'Произошла неизвестная ошибка';

  const msg = message.toLowerCase();

  // Ошибки авторизации и регистрации (Users & Permissions)
  if (msg.includes('invalid identifier or password')) return 'Неверный email или пароль';
  if (msg.includes('email or username are already taken')) return 'Пользователь с таким email уже зарегистрирован';
  if (msg.includes('email must be a valid email')) return 'Введите корректный адрес электронной почты';
  if (msg.includes('password must be at least')) return 'Пароль слишком короткий (минимум 6 символов)';
  if (msg.includes('auth.form.error.email.taken')) return 'Этот email уже занят';
  if (msg.includes('auth.form.error.username.taken')) return 'Это имя пользователя уже занято';
  
  // Ошибки валидации полей
  if (msg.includes('is a required field')) return 'Заполните все обязательные поля';
  if (msg.includes('must be a number')) return 'Оценка должна быть числом';
  if (msg.includes('must be greater than or equal to 1')) return 'Оценка должна быть от 1 до 5';
  if (msg.includes('must be less than or equal to 5')) return 'Оценка должна быть от 1 до 5';
  
  // Ошибки доступа
  if (msg.includes('forbidden')) return 'Ошибка доступа. У вас нет прав на это действие';
  if (msg.includes('unauthorized')) return 'Вы не авторизованы. Пожалуйста, войдите в аккаунт';

  // Ошибки сети и сервера
  if (msg.includes('failed to fetch')) return 'Ошибка сети. Проверьте интернет-соединение';
  if (msg.includes('bad request')) return 'Неверный запрос. Проверьте введенные данные';

  // Если перевод не найден, возвращаем оригинал (или можно вернуть "Ошибка сервера")
  return `Ошибка: ${message}`;
}