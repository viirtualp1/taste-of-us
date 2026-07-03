export const MOCK_TELEGRAM_USER = {
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  language_code: 'en',
  is_premium: false,
} as const

export const MOCK_INIT_DATA =
  'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Dev%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22devuser%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1700000000&hash=dev_mock_hash'
