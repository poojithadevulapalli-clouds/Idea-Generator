import React, { useState } from "react";
import { GeneratorConfig, DifficultyType } from "../types";
import { PRESETS, POPULAR_STACKS, POPULAR_DOMAINS, POPULAR_CONSTRAINTS } from "../data/presets";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

interface IdeaGeneratorFormProps {
  onGenerate: (config: GeneratorConfig) => void;
  isLoading: boolean;
}

export default function IdeaGeneratorForm({ onGenerate, isLoading }: IdeaGeneratorFormProps) {
  const [config, setConfig] = useState<GeneratorConfig>({
    prompt: "",
    difficulty: "Intermediate",
    domain: "AI & Machine Learning",
    techStack: ["React", "SQLite", "Tailwind CSS"],
    constraints: ["Offline-first"]
  });

  const handleApplyPreset = (presetName: string) => {
    const found = PRESETS.find(p => p.name === presetName);
    if (found) {
      setConfig({
        prompt: found.prompt,
        difficulty: found.difficulty,
        domain: found.domain,
        techStack: [...found.techStack],
        constraints: [...found.constraints]
      });
    }
  };

  const handleToggleStack = (tech: string) => {
    setConfig(prev => {
      const idx = prev.techStack.indexOf(tech);
      if (idx > -1) {
        return { ...prev, techStack: prev.techStack.filter(t => t !== tech) };
      } else {
        return { ...prev, techStack: [...prev.techStack, tech] };
      }
    });
  };

  const handleToggleConstraint = (constraint: string) => {
    setConfig(prev => {
      const idx = prev.constraints.indexOf(constraint);
      if (idx > -1) {
        return { ...prev, constraints: prev.constraints.filter(c => c !== constraint) };
      } else {
        return { ...prev, constraints: [...prev.constraints, constraint] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <div id="idea-generator-form-container" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      
      {/* Playful preset loader */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Quick-Start Idea Presets
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => {
            const isMatched = config.prompt === preset.prompt;
            return (
              <button
                key={preset.name}
                type="button"
                id={`preset-${preset.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleApplyPreset(preset.name)}
                className={`text-left p-3 rounded-lg border text-xs transition duration-200 group relative overflow-hidden ${
                  isMatched
                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-medium"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-semibold truncate mb-1 group-hover:text-indigo-600">{preset.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{preset.prompt}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Main Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            1. Core Theme or Keywords
          </label>
          <textarea
            id="prompt-textarea"
            rows={3}
            value={config.prompt}
            onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
            placeholder="e.g. A gamified chore companion, custom audio soundscape mixer, budget tracker for freelancers..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            2. Hardness / Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(["Beginner", "Intermediate", "Advanced"] as DifficultyType[]).map((level) => {
              const active = config.difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  id={`difficulty-${level.toLowerCase()}`}
                  onClick={() => setConfig({ ...config, difficulty: level })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/10"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Domain */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            3. Vertical Domain
          </label>
          <select
            id="domain-select"
            value={config.domain}
            onChange={(e) => setConfig({ ...config, domain: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          >
            {POPULAR_DOMAINS.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>

        {/* Tech Stack Pills Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            4. Choose Tech Stack Technologies
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
            {POPULAR_STACKS.map((tech) => {
              const active = config.techStack.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  id={`tech-pill-${tech.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleToggleStack(tech)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {tech}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stated Constraints / Goals */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            5. Design Guidelines & Constraints
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-28 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
            {POPULAR_CONSTRAINTS.map((constraint) => {
              const checked = config.constraints.includes(constraint);
              return (
                <label
                  key={constraint}
                  className="flex items-start gap-2.5 p-1 rounded hover:bg-white text-xs text-slate-600 cursor-pointer transition select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleConstraint(constraint)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span>{constraint}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Generate / Action Button */}
        <button
          type="submit"
          id="btn-generate-plans"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-md shadow-indigo-600/15 cursor-pointer hover:shadow-indigo-600/25 transition duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini Designing Blueprints...</span>
            </>
          ) : (
            <>
              <span>Generate AI Project Concepts</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
