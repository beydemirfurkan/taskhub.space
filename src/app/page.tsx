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
          <div className="min-h-screen bg-background/50">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-3 h-14 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">TaskHub</h1>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">Personal Workspace</span>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <div className="h-6 w-px bg-border/50" />
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-200"
                      }
                    }}
                  />
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              <KanbanBoardComponent />
            </main>
          </div>
        </MainAppWrapper>
      </SignedIn>
    </div>
  );
}
