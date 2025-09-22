import { getDbClient } from '@flash-sale/domain-core';

export type UserRow = { id: string; email: string };

export const fetchUsers = async (dbUrl: string, limit: number): Promise<UserRow[]> => {
  const { queryClient } = getDbClient(dbUrl, { ssl: false, logQueries: false });
  try {
    const rows = (await queryClient.unsafe(
      `select id, email from core_data.users order by created_at desc limit ${limit}`,
    )) as UserRow[];
    return rows;
  } finally {
    await queryClient.end();
  }
};

export const loginUsers = async (
  baseUrl: string,
  users: { email: string; password: string }[],
): Promise<{ email: string; token: string }[]> => {
  const url = `${baseUrl.replace(/\/$/, '')}/users/authenticate`;
  const results: { email: string; token: string }[] = [];
  for (const u of users) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, password: u.password }),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as { token: string };
    if (data?.token) results.push({ email: u.email, token: data.token });
  }
  return results;
};

export const countOrders = async (dbUrl: string): Promise<number> => {
  const { queryClient } = getDbClient(dbUrl, { ssl: false, logQueries: false });
  try {
    const rows = (await queryClient.unsafe(
      `select count(*)::int as count from core_data.orders`,
    )) as { count: number }[];
    return rows[0]?.count ?? 0;
  } finally {
    await queryClient.end();
  }
};
