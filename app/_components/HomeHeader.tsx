"use client";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, ArrowUpRight } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import Brand from "./Brand";

const navigation = [
  ["/", "Home"],
  ["/pricing", "Pricing"],
  ["/contact-us", "Contact us"],
];
const subscribeHydration = () => () => {};
export function HomeHeader() {
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const pathname = usePathname();
  const { isLoaded } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 821px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  const links = navigation.map(([href, label]) => (
    <Link
      key={href}
      href={href}
      aria-current={pathname === href ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {label}
    </Link>
  ));


  return (
    <header className="tc-header" data-scrolled={scrolled} data-landing={pathname === "/"}>
      <a className="tc-skip" href="#main-content">
        Skip to content
      </a>
      <div className="tc-nav-inner">
        <Brand />
        <nav className="tc-desktop-nav" aria-label="Main navigation">
          {links}
        </nav>
        <div className="tc-nav-actions">
          <button
            className="tc-icon-button"
            aria-label="Toggle light and dark theme"
            aria-pressed={hydrated ? resolvedTheme === "dark" : false}
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun size={21} className="tc-theme-sun" />
            <Moon size={21} className="tc-theme-moon" />
          </button>
          {!hydrated || !isLoaded ? <span aria-hidden="true" className="tc-auth-placeholder" /> : <>
          <SignedOut>
            <Link className="tc-nav-account" href="/sign-in">
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              className="tc-nav-account tc-desktop-account"
              aria-current={pathname === "/dashboard" ? "page" : undefined}
              href="/dashboard"
            >
              My trips
            </Link>
            <Link className="tc-create-link" href="/create-new-trip">
              Plan a trip <ArrowUpRight size={15} />
            </Link>
            <UserButton />
          </SignedIn>
          </>}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                className="tc-icon-button tc-menu-trigger"
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="tc-menu-backdrop" />
              <Dialog.Content
                className="tc-menu"
                aria-describedby="navigation-description"
              >
                <div className="tc-menu-heading">
                  <Dialog.Title>Explore TripCraft</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="tc-icon-button"
                      aria-label="Close navigation menu"
                    >
                      <X />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description id="navigation-description">
                  Your next adventure starts here.
                </Dialog.Description>
                <nav aria-label="Mobile navigation">
                  {links}
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      aria-current={
                        pathname === "/dashboard" ? "page" : undefined
                      }
                      onClick={() => setOpen(false)}
                    >
                      My trips
                    </Link>
                  </SignedIn>
                  <Link href="/create-new-trip" onClick={() => setOpen(false)}>
                    Plan a trip <ArrowUpRight size={18} />
                  </Link>
                </nav>
                <SignedOut>
                  <div className="tc-menu-account">
                    <Link
                      className="tc-button"
                      href="/sign-up"
                      onClick={() => setOpen(false)}
                    >
                      Create an account
                    </Link>
                    <Link href="/sign-in" onClick={() => setOpen(false)}>
                      Already exploring? Sign in
                    </Link>
                  </div>
                </SignedOut>
                <SignedIn>
                  <SignOutButton>
                    <button
                      className="tc-secondary-button"
                      onClick={() => setOpen(false)}
                    >
                      Sign out
                    </button>
                  </SignOutButton>
                </SignedIn>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
