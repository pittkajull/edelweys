import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Heyy yoww! 👋🌸 Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history,
          user_id: userId,
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Aduh, Edelweys lagi error nih 😢 Coba lagi ya!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.avatar}>🌸</span>
          <div>
            <p style={styles.headerName}>Edelweys</p>
            <p style={styles.headerStatus}>● Online</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => navigate("/dashboard")} style={styles.dashBtn}>
            📊 Dashboard
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background: msg.role === "user" ? "#e91e8c" : "white",
              color: msg.role === "user" ? "white" : "#333",
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, alignSelf: "flex-start", background: "white", color: "#aaa" }}>
            Edelweys lagi ngetik... ✍️
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesanmu di sini... (Enter untuk kirim)"
          style={styles.textarea}
          rows={1}
        />
        <button onClick={sendMessage} style={styles.sendBtn} disabled={loading}>
          {loading ? "..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#fce4ec",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    background: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: { fontSize: "2rem" },
  headerName: { margin: 0, fontWeight: "bold", color: "#e91e8c", fontSize: "1.1rem" },
  headerStatus: { margin: 0, fontSize: "0.75rem", color: "#4caf50" },
  logoutBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "1px solid #e91e8c",
    background: "white",
    color: "#e91e8c",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  dashBtn: {
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    border: "1px solid #4CAF7D",
    background: "white",
    color: "#4CAF7D",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  bubble: {
    maxWidth: "70%",
    padding: "0.75rem 1rem",
    borderRadius: "16px",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    whiteSpace: "pre-wrap",
  },
  inputArea: {
    display: "flex",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    background: "white",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
  },
  textarea: {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "12px",
    border: "none",
    background: "#e91e8c",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
};