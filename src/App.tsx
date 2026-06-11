import React, { useState, useEffect } from "react";
import { ProjectBlueprint, GeneratorConfig } from "./types";
import IdeaGeneratorForm from "./components/IdeaGeneratorForm";
import ProjectWorkspace from "./components/ProjectWorkspace";
import { 
  Lightbulb, 
  Trash2, 
  FolderLock, 
  HelpCircle, 
  ArrowRight, 
  Flame, 
  Database, 
  Code,
  Sparkles,
  BookMarked,
  Layers,
  Terminal,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function App() {
  const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
  const [savedBlueprints, setSavedBlueprints] = useState<ProjectBlueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState<ProjectBlueprint | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Completed checklist task keys state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Load saved state from localStorage
  useEffect(() => {
    const localSaved = localStorage.getItem("ai-project-studio-saved");
    if (localSaved) {
      try {
        setSavedBlueprints(JSON.parse(localSaved));
      } catch (e) {
        console.error("Failed loading saved projects", e);
      }
    }

    const localTasks = localStorage.getItem("ai-project-studio-tasks");
    if (localTasks) {
      try {
        setCompletedTasks(JSON.parse(localTasks));
      } catch (e) {
        console.error("Failed loading tasks", e);
      }
    }
  }, []);

  // Handler: Generate Ideas
  const handleGenerateIdeas = async (config: GeneratorConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "An unknown system error occurred.");
      }

      const generatedList: ProjectBlueprint[] = data.projects || [];
      setBlueprints(generatedList);
      
      if (generatedList.length > 0) {
        setSelectedBlueprint(generatedList[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "Failed to reach the AI design system. Please verify you have configured your GEMINI_API_KEY in Settings > Secrets."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle bookmark projects
  const handleToggleBookmark = (blueprint: ProjectBlueprint) => {
    setSavedBlueprints(prev => {
      const exists = prev.some(b => b.id === blueprint.id);
      let updated;
      if (exists) {
        updated = prev.filter(b => b.id !== blueprint.id);
      } else {
        updated = [...prev, blueprint];
      }
      localStorage.setItem("ai-project-studio-saved", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteSaved = (blueprintId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedBlueprints(prev => {
      const updated = prev.filter(b => b.id !== blueprintId);
      localStorage.setItem("ai-project-studio-saved", JSON.stringify(updated));
      return updated;
    });
    if (selectedBlueprint?.id === blueprintId) {
      setSelectedBlueprint(blueprints[0] || null);
    }
  };

  // Toggle completed steps
  const handleToggleTask = (taskKey: string) => {
    setCompletedTasks(prev => {
      const updated = prev.includes(taskKey)
        ? prev.filter(k => k !== taskKey)
        : [...prev, taskKey];
      localStorage.setItem("ai-project-studio-tasks", JSON.stringify(updated));
      return updated;
    });
  };

  // Reset checklist for a specific project
  const handleResetTasks = (blueprintId: string) => {
    setCompletedTasks(prev => {
      // Each milestone key contains e.g. "Phase 1: Setup - Task"
      // Filter out any key that has a substring match to the project's milestones
      // Inside ProjectWorkspace the key is generated as `${milestone.phase}-${task}`. We can match by finding it in total blueprint structure.
      if (!selectedBlueprint) return prev;
      const keysToRemove = selectedBlueprint.milestones.flatMap(m => m.tasks.map(t => `${m.phase}-${t}`));
      const updated = prev.filter(k => !keysToRemove.includes(k));
      localStorage.setItem("ai-project-studio-tasks", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div id="application-container" className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      
      {/* Premium Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">AI Project Studio</h1>
                <span className="bg-indigo-500/10 text-indigo-300 font-mono text-[9px] uppercase tracking-wider font-bold rounded px-1.5 py-0.5 border border-indigo-500/20">
                  Gemini-3.5-powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Micro-workspace generator for engineers and builders</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Contextual AI Consultant Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Concept Formulation / Filters */}
        <div className="lg:col-span-4 space-y-6">
          
          <IdeaGeneratorForm 
            onGenerate={handleGenerateIdeas} 
            isLoading={isLoading} 
          />

          {/* Workbench Repository Inventory */}
          <div id="workbench-inventory" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Active Workbench
              </h3>
              <span className="text-[10px] bg-slate-100 font-bold text-slate-500 rounded-full px-2 py-0.5">
                {savedBlueprints.length + blueprints.length} blueprints
              </span>
            </div>

            {/* Generated results List */}
            {blueprints.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Proposals</span>
                <div className="space-y-1.5">
                  {blueprints.map((item) => {
                    const active = selectedBlueprint?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`blueprint-item-${item.id}`}
                        onClick={() => setSelectedBlueprint(item)}
                        className={`w-full text-left p-3 rounded-xl border transition ${
                          active 
                            ? "border-indigo-600 bg-indigo-50/20 text-indigo-900 font-semibold" 
                            : "border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold truncate pr-2">{item.title}</span>
                          <span className="text-[9px] font-bold tracking-tight uppercase px-1.5 py-0.5 rounded bg-slate-100/80 text-slate-500">
                            {item.difficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{item.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bookmarked / Saved Items list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Blueprints</span>
              {savedBlueprints.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <BookMarked className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-[10px] text-slate-500">No project blueprints bookmarked yet.</p>
                  <p className="text-[9px] text-slate-400/80 mt-0.5">Click "Save to Workbench" in any workspace to pin it here.</p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {savedBlueprints.map((item) => {
                    const active = selectedBlueprint?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`saved-blueprint-${item.id}`}
                        onClick={() => setSelectedBlueprint(item)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                          active 
                            ? "border-indigo-600 bg-indigo-50/20 text-indigo-900 font-semibold" 
                            : "border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate">{item.title}</span>
                            <span className="text-[8px] bg-indigo-50/80 text-indigo-600 font-bold uppercase rounded px-1">PIN</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{item.tagline}</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSaved(item.id, e)}
                          id={`delete-saved-${item.id}`}
                          className="p-1 px-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Dynamic Project Blueprint Workspace */}
        <div className="lg:col-span-8 flex flex-col h-full">
          {error && (
            <div id="error-banner" className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-rose-500 mt-0.5 text-base">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">Design Generation Obstacle</h4>
                  <p className="text-xs text-rose-700 leading-relaxed mt-1.5">{error}</p>
                  <p className="text-[10px] text-rose-600/80 leading-relaxed mt-2 bg-white/70 px-3 py-2 rounded-lg border border-rose-100 font-mono">
                    <strong>Suggestion:</strong> If you are testing offline, please verify that your system is running the dynamic local developer key, or insert the Gemini Key into the env list in `Secrets`.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedBlueprint ? (
            <ProjectWorkspace
              blueprint={selectedBlueprint}
              isBookmarked={savedBlueprints.some(b => b.id === selectedBlueprint.id)}
              onToggleBookmark={() => handleToggleBookmark(selectedBlueprint)}
              completedTasks={completedTasks}
              onToggleTask={handleToggleTask}
              onResetTasks={() => handleResetTasks(selectedBlueprint.id)}
            />
          ) : (
            /* Onboarding On-deck Screen */
            <div id="onboarding-desk" className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col justify-center items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enter Your Design Parameters</h2>
              <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
                Configure your target stack, difficulty levels, domains, and core design bounds on the left. Gemini will generate structured blueprint cards, database schemas, roadmap, and customized file code templates on-demand.
              </p>

              {/* Pro Feature Previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl w-full mt-10">
                <div className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-200 transition">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800">1. Interactive Database Modeling</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    View completely mapped relational structures or collection nodes, specifically formatted with primary keys and typing.
                  </p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-200 transition">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Code className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800">2. Starter Source Code Sandbox</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Browse real-world server, React components, and model snippets with syntax highlighting. Includes single-click clipboard copies!
                  </p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-200 transition">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800">3. Phase Checklists</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Mark stages complete with persistent checkpoint progress counters. Automatically persists so you never lose your progress.
                  </p>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-200 transition">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-bold text-slate-800">4. Tech Mentor Advisor</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Activate the dedicated, context-aware tech chatbot. Ask specific syntax, database query, or feature questions live.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-2 text-xs text-indigo-600 font-semibold animate-pulse">
                <span>Select a preset above to take a quick test drive</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-[10px] text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 AI Project Studio • Created using Google Gemini 3.5 Flash & Full-Stack Node.js Router</p>
          <p className="mt-1 text-slate-400/80">Design is desktop-fluid and perfectly mobile-responsive.</p>
        </div>
      </footer>

    </div>
  );
}

