import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { KanbanBoardComponent } from '@/components/kanban-board';
import { ThemeToggle } from '@/components/theme-toggle';
import { MainAppWrapper } from '@/components/main-app-wrapper';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">TaskFlow</h1>
            <p className="text-lg text-muted-foreground mb-8">Collaborative Task Platform</p>
            <SignInButton mode="modal">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <MainAppWrapper>
          <div className="min-h-screen">
            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-semibold">TaskHub</h1>
                  <span className="text-sm text-muted-foreground">Personal Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <UserButton />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-6">
              <KanbanBoardComponent />
            </main>
          </div>
        </MainAppWrapper>
      </SignedIn>
    </div>
  );
}
