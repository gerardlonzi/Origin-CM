import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Accessibles sans compte du tout
const PUBLIC_ROUTES = ["/", "/verifications"];
// Toujours accessibles peu importe l'état de connexion (token dans l'URL fait office de clé)
const ALWAYS_ALLOWED_PREFIXES = ["/auth/"];
// Réservées aux visiteurs NON connectés — un utilisateur déjà connecté est redirigé ailleurs
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isAlwaysAllowed = ALWAYS_ALLOWED_PREFIXES.some((p) => path.startsWith(p));
  if (isAlwaysAllowed) return response;

  const isPublic = PUBLIC_ROUTES.includes(path);

  // Pas connecté et route privée → login
  if (!user && !isPublic && !AUTH_ONLY_ROUTES.includes(path) && path !== "/complete-profile") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!user && path === "/complete-profile") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Connecté → on vérifie l'état du profil pour rediriger intelligemment
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    const hasProfile = !!profile;

    // Déjà connecté → pages login/signup/forgot-password interdites
    if (AUTH_ONLY_ROUTES.includes(path)) {
      return NextResponse.redirect(new URL(hasProfile ? "/dashboard" : "/complete-profile", request.url));
    }

    // Profil pas encore complété → forcé de passer par complete-profile
    // (sauf sur reset-password, nécessaire pour le flux de récupération)
    if (!hasProfile && path !== "/complete-profile" && path !== "/reset-password" && !isPublic) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    // Profil déjà complété → plus besoin de repasser par complete-profile
    if (hasProfile && path === "/complete-profile") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};