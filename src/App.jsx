import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bell, Check, HelpCircle, Home, MessageCircle, PenLine, Search, Send, User } from "lucide-react";

const sampleQuestions = [
  {
    id: "q1",
    title: "How do I solve this logarithm equation?",
    body: "Solve: ln(x - 1) + ln(x + 2) = ln(10). I know I need to combine logs, but I get confused after that.",
    topic: "Algebra",
    author: "Amina",
    createdAt: Date.now() - 1000 * 60 * 35,
    answers: [
      {
        id: "a1",
        author: "Leo",
        body: "Use ln(a) + ln(b) = ln(ab). Therefore ln((x - 1)(x + 2)) = ln(10), so (x - 1)(x + 2) = 10. Expanding gives x² + x - 2 = 10, therefore x² + x - 12 = 0. Factorising gives (x + 4)(x - 3) = 0. Since x must be greater than 1, the valid answer is x = 3.",
        createdAt: Date.now() - 1000 * 60 * 20,
      },
    ],
  },
  {
    id: "q2",
    title: "Why does completing the square work?",
    body: "I understand the steps, but I do not understand why x² + 6x + 5 becomes (x + 3)² - 4.",
    topic: "Quadratics",
    author: "Sam",
    createdAt: Date.now() - 1000 * 60 * 80,
    answers: [],
  },
  {
    id: "q3",
    title: "Stationary points of y = x³ - 6x² + 9x + 2",
    body: "I differentiated and got 3x² - 12x + 9, but I do not know how to identify the maximum and minimum points.",
    topic: "Calculus",
    author: "Maya",
    createdAt: Date.now() - 1000 * 60 * 140,
    answers: [],
  },
];

const starterNotifications = [
  {
    id: "n1",
    questionId: "q1",
    title: "Your question was answered",
    message: "Leo answered your logarithms question.",
    createdAt: Date.now() - 1000 * 60 * 18,
    read: false,
    forUser: "Amina",
  },
];

const topics = ["Algebra", "Calculus", "Trigonometry", "Statistics", "Mechanics", "Geometry", "Other"];
const symbols = ["π", "√", "θ", "∞", "≤", "≥", "≈", "∫", "∑", "²", "³", "log", "ln", "sin", "cos", "tan"];

const nodes = [
  { id: "ask", label: "Ask", icon: PenLine, x: 0, y: -180 },
  { id: "browse", label: "Browse", icon: Search, x: 190, y: 0 },
  { id: "answer", label: "Answer", icon: MessageCircle, x: 0, y: 180 },
  { id: "alerts", label: "Alerts", icon: Bell, x: -190, y: 0 },
];

function getSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function timeAgo(time) {
  const seconds = Math.max(1, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Tag({ children }) {
  return <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/65">{children}</span>;
}

function Field(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-white/60 focus:bg-white/[0.06]"
    />
  );
}

function PageFrame({ page, children, navigate, currentUser, setCurrentUser, unreadCount }) {
  return (
    <motion.main
      key={page}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-black px-4 py-6 text-white md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4 border-b border-white/15 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("home")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"
              aria-label="Go home"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate("home")}
              className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 transition hover:border-white hover:text-white sm:flex"
            >
              <Home size={15} />
              Home
            </button>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => navigate(node.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  page === node.id
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white/60 hover:border-white hover:text-white"
                }`}
              >
                {node.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 sm:flex">
              <User size={15} className="text-white/45" />
              <input
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="w-24 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="Name"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("alerts")}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white hover:bg-white hover:text-black"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-black">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {children}
      </div>
    </motion.main>
  );
}

export default function MathsLoopSmoothPages() {
  const [currentUser, setCurrentUser] = useState(() => getSaved("smooth_user", "You"));
  const [questions, setQuestions] = useState(() => getSaved("smooth_questions", sampleQuestions));
  const [notifications, setNotifications] = useState(() => getSaved("smooth_notifications", starterNotifications));
  const [mapOpen, setMapOpen] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedId, setSelectedId] = useState("q1");
  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");
  const [newQuestion, setNewQuestion] = useState({ title: "", body: "", topic: "Algebra" });
  const [answerText, setAnswerText] = useState("");
  const [toast, setToast] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => localStorage.setItem("smooth_user", JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem("smooth_questions", JSON.stringify(questions)), [questions]);
  useEffect(() => localStorage.setItem("smooth_notifications", JSON.stringify(notifications)), [notifications]);

  const selectedQuestion = questions.find((q) => q.id === selectedId) || questions[0];
  const unreadCount = notifications.filter((n) => !n.read && n.forUser === currentUser).length;
  const userNotifications = notifications.filter((n) => n.forUser === currentUser);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        const text = `${q.title} ${q.body} ${q.topic}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (topicFilter === "All" || q.topic === topicFilter);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [questions, query, topicFilter]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1900);
  }

  function navigate(nextPage) {
    setPage(nextPage);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10);
  }

  function submitQuestion(e) {
    e.preventDefault();
    const title = newQuestion.title.trim();
    const body = newQuestion.body.trim();

    if (!title || !body) {
      showToast("Add a title and question first");
      return;
    }

    const question = {
      id: makeId("q"),
      title,
      body,
      topic: newQuestion.topic,
      author: currentUser || "Anonymous",
      createdAt: Date.now(),
      answers: [],
    };

    setQuestions((prev) => [question, ...prev]);
    setSelectedId(question.id);
    setNewQuestion({ title: "", body: "", topic: "Algebra" });
    navigate("answer");
    showToast("Question posted");
  }

  function submitAnswer(e) {
    e.preventDefault();
    const body = answerText.trim();

    if (!selectedQuestion || !body) {
      showToast("Write an answer first");
      return;
    }

    const answer = {
      id: makeId("a"),
      author: currentUser || "Anonymous",
      body,
      createdAt: Date.now(),
    };

    setQuestions((prev) =>
      prev.map((q) => (q.id === selectedQuestion.id ? { ...q, answers: [...q.answers, answer] } : q))
    );

    if ((currentUser || "Anonymous") !== selectedQuestion.author) {
      setNotifications((prev) => [
        {
          id: makeId("n"),
          questionId: selectedQuestion.id,
          title: "New answer",
          message: `${currentUser || "Anonymous"} answered: ${selectedQuestion.title}`,
          createdAt: Date.now(),
          read: false,
          forUser: selectedQuestion.author,
        },
        ...prev,
      ]);
    }

    setAnswerText("");
    showToast("Answer posted");
  }

  function openQuestion(id) {
    setSelectedId(id);
    navigate("answer");
  }

  function openNotification(notification) {
    setSelectedId(notification.questionId);
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    navigate("answer");
  }

  function insertSymbol(symbol) {
    setNewQuestion((prev) => ({ ...prev, body: `${prev.body}${symbol}` }));
    bodyRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.main
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white"
          >
            <section className="relative flex h-[620px] w-full max-w-[760px] items-center justify-center">
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 760 620" fill="none" aria-hidden="true">
                <AnimatePresence>
                  {mapOpen &&
                    nodes.map((node, index) => (
                      <motion.line
                        key={node.id}
                        x1="380"
                        y1="310"
                        x2={380 + node.x}
                        y2={310 + node.y}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                      />
                    ))}
                </AnimatePresence>
              </svg>

              <AnimatePresence>
                {mapOpen &&
                  nodes.map((node, index) => {
                    const Icon = node.icon;
                    return (
                      <motion.button
                        key={node.id}
                        type="button"
                        onClick={() => navigate(node.id)}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.72 }}
                        animate={{ x: node.x, y: node.y, opacity: 1, scale: 1 }}
                        exit={{ x: 0, y: 0, opacity: 0, scale: 0.72 }}
                        transition={{ duration: 0.42, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/20 bg-black text-sm text-white transition hover:border-white hover:bg-white hover:text-black md:h-32 md:w-32"
                        aria-label={node.label}
                      >
                        <Icon size={22} />
                        <span className="mt-2 text-sm">{node.label}</span>
                        {node.id === "alerts" && unreadCount > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border border-white bg-black px-1 text-xs text-white">
                            {unreadCount}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={() => setMapOpen((prev) => !prev)}
                whileTap={{ scale: 0.96 }}
                animate={{ scale: mapOpen ? 0.92 : 1 }}
                transition={{ duration: 0.25 }}
                className="absolute z-30 flex h-36 w-36 items-center justify-center rounded-full border border-white bg-white text-5xl font-light text-black transition hover:bg-black hover:text-white md:h-44 md:w-44 md:text-6xl"
                aria-label="Open maths map"
              >
                ∑
              </motion.button>
            </section>
          </motion.main>
        )}

        {page === "ask" && (
          <PageFrame key="ask" page="ask" navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} unreadCount={unreadCount}>
            <section className="mx-auto max-w-3xl">
              <form onSubmit={submitQuestion} className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/[0.025] p-5 md:p-7">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field value={currentUser} onChange={(e) => setCurrentUser(e.target.value)} placeholder="Your name" />
                  <select
                    value={newQuestion.topic}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, topic: e.target.value }))}
                    className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-white/60"
                  >
                    {topics.map((topic) => (
                      <option key={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <Field
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Question title"
                />

                <textarea
                  ref={bodyRef}
                  value={newQuestion.body}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, body: e.target.value }))}
                  rows={9}
                  placeholder="Type the maths problem and where you got stuck"
                  className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3 leading-7 text-white outline-none transition placeholder:text-white/35 focus:border-white/60 focus:bg-white/[0.06]"
                />

                <div className="flex flex-wrap gap-2">
                  {symbols.map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => insertSymbol(symbol)}
                      className="rounded-full border border-white/20 px-3 py-2 text-sm text-white/70 transition hover:border-white hover:text-white"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                <button type="submit" className="rounded-full bg-white px-5 py-3 font-medium text-black transition hover:bg-white/85">
                  Post question
                </button>
              </form>
            </section>
          </PageFrame>
        )}

        {page === "browse" && (
          <PageFrame key="browse" page="browse" navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} unreadCount={unreadCount}>
            <section className="mx-auto max-w-4xl">
              <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
                <Field value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" />
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-white/60"
                >
                  <option>All</option>
                  {topics.map((topic) => (
                    <option key={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3">
                {filteredQuestions.length === 0 ? (
                  <p className="rounded-2xl border border-white/15 p-5 text-white/60">No questions found.</p>
                ) : (
                  filteredQuestions.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => openQuestion(q.id)}
                      className="rounded-3xl border border-white/15 bg-white/[0.025] p-5 text-left transition hover:border-white/45 hover:bg-white/[0.06]"
                    >
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Tag>{q.topic}</Tag>
                        <Tag>{q.answers.length} answers</Tag>
                        <Tag>{timeAgo(q.createdAt)}</Tag>
                      </div>
                      <h3 className="text-xl font-medium text-white">{q.title}</h3>
                      <p className="mt-2 line-clamp-2 leading-6 text-white/55">{q.body}</p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </PageFrame>
        )}

        {page === "answer" && selectedQuestion && (
          <PageFrame key="answer" page="answer" navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} unreadCount={unreadCount}>
            <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <article>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Tag>{selectedQuestion.topic}</Tag>
                  <Tag>{selectedQuestion.author}</Tag>
                  <Tag>{timeAgo(selectedQuestion.createdAt)}</Tag>
                </div>
                <h1 className="text-2xl font-medium leading-tight md:text-4xl">{selectedQuestion.title}</h1>
                <p className="mt-5 whitespace-pre-wrap rounded-3xl border border-white/15 bg-white/[0.025] p-5 leading-7 text-white/75">
                  {selectedQuestion.body}
                </p>

                <div className="mt-6 grid gap-3">
                  {selectedQuestion.answers.length === 0 ? (
                    <p className="rounded-2xl border border-white/15 p-5 text-white/55">No answers yet.</p>
                  ) : (
                    selectedQuestion.answers.map((answer) => (
                      <div key={answer.id} className="rounded-3xl border border-white/15 bg-white/[0.025] p-5">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white/50">
                          <strong className="text-white/80">{answer.author}</strong>
                          <span>{timeAgo(answer.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-7 text-white/75">{answer.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <aside>
                <form onSubmit={submitAnswer} className="sticky top-6 rounded-3xl border border-white/15 bg-white/[0.025] p-4">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={10}
                    placeholder="Explain the method step by step"
                    className="w-full resize-none rounded-2xl border border-white/15 bg-black px-4 py-3 leading-7 text-white outline-none transition placeholder:text-white/35 focus:border-white/60"
                  />
                  <button type="submit" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-medium text-black transition hover:bg-white/85">
                    <Send size={16} /> Post answer
                  </button>
                </form>
              </aside>
            </section>
          </PageFrame>
        )}

        {page === "alerts" && (
          <PageFrame key="alerts" page="alerts" navigate={navigate} currentUser={currentUser} setCurrentUser={setCurrentUser} unreadCount={unreadCount}>
            <section className="mx-auto max-w-3xl">
              <div className="grid gap-3">
                {userNotifications.length === 0 ? (
                  <p className="rounded-2xl border border-white/15 p-5 text-white/55">No notifications for {currentUser || "Anonymous"}.</p>
                ) : (
                  userNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className="rounded-3xl border border-white/15 bg-white/[0.025] p-5 text-left transition hover:border-white/45 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-medium">{notification.title}</h3>
                          <p className="mt-2 text-white/55">{notification.message}</p>
                          <p className="mt-3 text-sm text-white/35">{timeAgo(notification.createdAt)}</p>
                        </div>
                        {!notification.read && <Check size={18} />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </PageFrame>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-white/20 bg-black/90 px-4 py-3 text-center text-sm text-white shadow-2xl backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
