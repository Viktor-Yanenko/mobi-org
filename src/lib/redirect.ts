// куди повернути після входу; лише шляхи нашого сайту, не чужі адреси
export const safeRedirect = (next: unknown) =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : '/profile';