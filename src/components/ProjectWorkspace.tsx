import React, { useState, useEffect, useRef } from "react";
import { ProjectBlueprint, ChatMessage } from "../types";
import { 
  BookOpen, 
  Database, 
  CheckSquare, 
  Code, 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Loader2, 
  Clock, 
  Flame, 
  Award,
  BookMarked,
  RotateCcw,
  PlusCircle,
  FileCode,
  Notebook
} from "lucide-react";

interface ProjectWorkspaceProps {
  blueprint: ProjectBlueprint;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  completedTasks: string[];
  onToggleTask: (taskKey: string) => void;
  onResetTasks: () => void;
}

type TabType = 'overview' | 'schema' | 'roadmap' | 'files' | 'coach' | 'notes';

export default function ProjectWorkspace({
  blueprint,
  isBookmarked,
  onToggleBookmark,
  completedTasks,
  onToggleTask,
  onResetTasks
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Starter code file state
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);

  // Chat consultant state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scratchpad Notes State
  const [notes, setNotes] = useState("");

  // Load notes from localStorage on project load
  useEffect(() => {
    const savedNotes = localStorage.getItem(`project-notes-${blueprint.id}`);
    setNotes(savedNotes || "");
    // Reset custom chat if blueprint changes
    setChatMessages([
      {
        id: "welc",
        sender: "assistant",
        text: `Hey there! I'm your dedicated tech consultant for **${blueprint.title}**.\n\nI'm fully trained on your custom system architecture, tech stack (${blueprint.techStack.join(', ')}), and features.\n\nAsk me anything! For example: \n- *'How do I setup physical tables for ${blueprint.databaseSchema?.[0]?.tableName || "the database"}?'*\n- *'Give me step-by-step instructions to implement Phase 1'*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSelectedFileIndex(0);
  }, [blueprint.id]);

  // Sync notes to local storage
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem(`project-notes-${blueprint.id}`, val);
  };

  // Scroll to bottom on chatbot updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: blueprint.title,
          techStack: blueprint.techStack,
          projectSummary: blueprint.description,
          messages: chatMessages,
          userMessage: userMsg.text
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: `⚠️ **Error matching consult query:** ${err.message || 'Please verify network or backend logs.'}\nMake sure your Gemini API Key is configured.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Progress calculations for tasks
  const projectTasks = blueprint.milestones.flatMap(m => m.tasks.map(t => `${m.phase}-${t}`));
  const completedProjectTasks = projectTasks.filter(k => completedTasks.includes(k));
  const progressRatio = projectTasks.length ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) : 0;

  // Render helper for markdown-like bold/italic in AI feedback
  const formatText = (txt: string) => {
    return txt.split("\n").map((line, i) => {
      // Check for code block segments
      if (line.startsWith("```")) return null;
      
      // Inline formatting
      let formatted = line;
      // Bold (e.g. **text**)
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Lists starting with -
      if (formatted.trim().startsWith("- ")) {
        return (
          <li key={i} className="ml-4 list-disc text-slate-700 leading-relaxed text-sm my-1" 
              dangerouslySetInnerHTML={{ __html: formatted.trim().substring(2) }} />
        );
      }
      return (
        <p key={i} className="text-slate-700 leading-relaxed text-sm mb-2" 
           dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div id="project-workspace-root" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Blueprint Header */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                blueprint.difficulty === 'Advanced' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                blueprint.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {blueprint.difficulty}
              </span>
              <span className="bg-slate-100 text-slate-600 border border-slate-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                {blueprint.domain}
              </span>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {blueprint.estimatedTime}
              </span>
            </div>
            <h1 id="blueprint-title" className="text-2xl font-bold text-slate-900 tracking-tight">{blueprint.title}</h1>
            <p className="text-sm text-slate-500 mt-1">{blueprint.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBookmark}
              id="bookmark-btn"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition duration-200 ${
                isBookmarked 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>{isBookmarked ? "Blueprint Saved" : "Save to Workbench"}</span>
            </button>
          </div>
        </div>

        {/* Tech stack badge strip */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-1.5">Tech Matrix:</span>
          {blueprint.techStack.map(tech => (
            <span key={tech} className="bg-slate-100/80 hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono transition">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1.5 bg-slate-50 border-b border-slate-100 px-4">
        {[
          { id: 'overview', label: '1. Overview', icon: BookOpen },
          { id: 'schema', label: '2. DB & Schema', icon: Database },
          { id: 'roadmap', label: '3. Phase Roadmap', icon: CheckSquare },
          { id: 'files', label: '4. Code Explorer', icon: Code },
          { id: 'coach', label: '5. Technical Coach', icon: MessageSquare },
          { id: 'notes', label: 'My Notes', icon: Notebook }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3.5 border-b-2 text-xs font-semibold transition ${
                active 
                  ? "border-indigo-600 text-indigo-600" 
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto p-6 min-h-[460px]">
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div id="overview-pane" className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Deep-Dive Concept</h2>
              <p className="text-slate-700 leading-relaxed text-sm bg-indigo-50/20 rounded-xl p-4 border border-indigo-50/50">{blueprint.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Outcomes */}
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  What You Will Master
                </h3>
                <ul className="space-y-2">
                  {blueprint.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Core Deliverables */}
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Highlighted MVP Architecture
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {blueprint.architecture}
                </p>
              </div>
            </div>

            {/* Challenges & Solutions */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Tactical Implementation Roadblocks</h3>
              <div className="grid grid-cols-1 gap-4">
                {blueprint.challenges.map((challenge, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:shadow-slate-50/50 hover:shadow-lg transition">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="text-red-500 font-mono">⚠️ Block #{idx + 1}:</span>
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                      <span className="font-semibold text-indigo-600 block mb-1 font-sans">AI Recommended Strategy:</span>
                      {challenge.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DB & Schema */}
        {activeTab === 'schema' && (
          <div id="schema-pane" className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Entity-Relationship & Database Tables</h2>
              <p className="text-xs text-slate-500">Every project requires structured data. Build following this optimal physical model.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blueprint.databaseSchema.map((entry, idx) => (
                <div key={idx} id={`db-table-${entry.tableName}`} className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-200 transition">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 font-mono text-xs font-semibold text-white flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{entry.tableName}</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-normal">Table Schema</span>
                  </div>
                  <div className="p-3.5 space-y-1.5 bg-white">
                    {entry.fields.map((f, fIdx) => {
                      const isPK = f.toLowerCase().includes("pk") || f.toLowerCase().includes("id: ");
                      return (
                        <div key={fIdx} className="flex justify-between items-center text-xs font-mono py-1 border-b border-slate-50 last:border-0">
                          <span className={`${isPK ? "text-indigo-600 font-semibold" : "text-slate-700"}`}>{f}</span>
                          {isPK && <span className="bg-indigo-50 text-[9px] text-indigo-700 font-bold uppercase rounded px-1 scale-90">PK</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Card */}
            <div className="p-5 bg-indigo-50/20 border border-indigo-100/50 rounded-xl mt-6">
              <h3 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">High-level Architectural Layout</h3>
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                {blueprint.architecture}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Milestones */}
        {activeTab === 'roadmap' && (
          <div id="roadmap-pane" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Task Management Roadmap</h2>
                <p className="text-xs text-slate-500">Cross out deliverables as you advance. Progress persists automatically.</p>
              </div>

              {/* Progress Bar widget */}
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{progressRatio}% Completed</div>
                  <div className="text-[10px] text-slate-500">{completedProjectTasks.length} / {projectTasks.length} Task Nodes</div>
                </div>
                <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progressRatio}%` }} />
                </div>
                {completedProjectTasks.length > 0 && (
                  <button
                    onClick={onResetTasks}
                    title="Reset all milestones state"
                    className="p-1 px-2 rounded hover:bg-slate-200/50 text-slate-500 hover:text-rose-600 text-[10px] uppercase font-semibold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Phase segments */}
            <div className="space-y-4">
              {blueprint.milestones.map((milestone, mIdx) => (
                <div key={mIdx} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:border-slate-200 transition">
                  <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 font-semibold text-xs text-slate-800 flex items-center justify-between">
                    <span>{milestone.phase}</span>
                    <span className="text-[10px] font-medium bg-slate-200/70 text-slate-600 rounded-full px-2 py-0.5">
                      Phase {mIdx + 1}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 bg-white">
                    {milestone.tasks.map((task, tIdx) => {
                      const key = `${milestone.phase}-${task}`;
                      const done = completedTasks.includes(key);
                      return (
                        <div
                          key={tIdx}
                          onClick={() => onToggleTask(key)}
                          className={`flex items-start gap-3.5 px-4 py-3.5 cursor-pointer leading-tight select-none transition ${
                            done ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                            done ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                            {done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <p className={`text-xs ${done ? "line-through text-slate-400 font-medium" : "text-slate-700 font-medium"}`}>
                              {task}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Code Sandboxes */}
        {activeTab === 'files' && (
          <div id="files-pane" className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Folder list */}
            <div className="lg:col-span-1 border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-col space-y-1.5 h-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 mb-1.5">Project Files</span>
              {blueprint.starterCode.map((item, idx) => {
                const active = selectedFileIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setCopiedFile(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-2.5 transition text-xs font-semibold ${
                      active 
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10" 
                        : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                    }`}
                  >
                    <FileCode className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{item.filename}</span>
                  </button>
                );
              })}
            </div>

            {/* Code pane */}
            <div className="lg:col-span-3 border border-slate-100 rounded-xl overflow-hidden flex flex-col h-full">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2 font-semibold">
                    {blueprint.starterCode[selectedFileIndex]?.filename}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCode(blueprint.starterCode[selectedFileIndex]?.code)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold px-3 py-1.5 rounded transition"
                >
                  {copiedFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Boilerplate</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto flex-1 min-h-[340px] leading-relaxed">
                <code>{blueprint.starterCode[selectedFileIndex]?.code}</code>
              </pre>

              <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
                <span>Syntax Target: {blueprint.starterCode[selectedFileIndex]?.language.toUpperCase()}</span>
                <span>Copy-paste this file directly into your local repository directory structure.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Technical Mentor Chatbot */}
        {activeTab === 'coach' && (
          <div id="coach-pane" className="flex flex-col h-[520px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Bot Header info */}
            <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Contextual Senior Developer Advisor</h3>
                <p className="text-[10px] text-slate-500">I know everything about {blueprint.title}'s stack ({blueprint.techStack.join(', ')}).</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Message display block */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chatMessages.map((msg) => {
                const isAI = msg.sender === 'assistant';
                return (
                  <div key={msg.id} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs ${
                      isAI 
                        ? "bg-white text-slate-800 border border-slate-100 rounded-tl-none" 
                        : "bg-indigo-600 text-white rounded-tr-none"
                    }`}>
                      <div className="markdown-body">
                        {isAI ? formatText(msg.text) : <p className="leading-relaxed">{msg.text}</p>}
                      </div>
                      <div className={`text-[9px] mt-1.5 text-right ${isAI ? "text-slate-400" : "text-indigo-200"}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Coach is drafting tactical advice...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendQuery} className="bg-white p-3.5 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                id="coach-chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask, e.g. "Draft table queries" or "Help me write starter state code" ...`}
                disabled={isChatLoading}
                className="flex-1 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl px-4 py-2 bg-slate-50/50"
              />
              <button
                type="submit"
                id="coach-send-btn"
                disabled={!inputText.trim() || isChatLoading}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 cursor-pointer transition border-0 shrink-0 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Notes */}
        {activeTab === 'notes' && (
          <div id="notes-pane" className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Project Scratchpad</h2>
              <p className="text-xs text-slate-500">Draft custom ideas, log environment variables, or track your custom files here. Persists locally in your browser cache.</p>
            </div>
            <textarea
              id="notes-scratchpad"
              rows={16}
              value={notes}
              onChange={handleNotesChange}
              placeholder="✏️ Click here to start jotting notes, drafting API specs, or task lists for this blueprint..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-xs font-mono text-slate-800 bg-amber-50/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
            />
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 select-none">
              <Notebook className="w-3.5 h-3.5" />
              <span>Auto-saved. Notes only apply to this current blueprint.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
