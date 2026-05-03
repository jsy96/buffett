'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessage = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content += text;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = '抱歉，股东先生/女士。我现在有点累了，请稍后再试。';
        return newMessages;
      });
    }

    setIsLoading(false);
  };

  const sampleQuestions = [
    '巴菲特先生，您能解释一下什么是能力圈吗？',
    '如何找到有护城河的公司？',
    '市场暴跌时应该怎么办？',
    '您能分享一下最难忘的投资失误吗？',
    '为什么您说比特币是老鼠药的平方？',
  ];

  const handleSampleQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="avatar">💰</div>
        <div>
          <h1 className="title">沃伦·巴菲特</h1>
          <p className="subtitle">奥马哈的先知 · Oracle of Omaha</p>
        </div>
      </header>

      {messages.length === 0 && (
        <div className="welcome-card">
          <p className="welcome-text">
            你好，股东先生/女士。
          </p>
          <p className="welcome-text">
            我是沃伦·巴菲特。我在奥马哈这栋小楼里工作了60多年，每天花80%的时间阅读和思考。
          </p>
          <p className="welcome-text">
            你可以问我关于投资、商业、或者人生的任何问题。如果我不懂，我会直接说"我不懂"——这是最高级的智慧。
          </p>
          <div className="signature">
            <p>—— 价格是你付出的，价值是你得到的。</p>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'assistant' ? '💰' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-role">
                {message.role === 'assistant' ? '沃伦·巴菲特' : '你'}
              </div>
              <div className="message-text">{message.content || '思考中...'}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="samples-container">
          <p className="samples-title">试试这些问题：</p>
          <div className="samples-grid">
            {sampleQuestions.map((question, index) => (
              <button
                key={index}
                className="sample-button"
                onClick={() => handleSampleQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="向巴菲特提问..."
          className="input-textarea"
          rows={2}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" className="send-button" disabled={isLoading || !input.trim()}>
          {isLoading ? '思考中...' : '发送'}
        </button>
      </form>

      <footer className="footer">
        <p>"有人今天坐在树荫下，是因为很久以前有人种了树。" —— 沃伦·巴菲特</p>
      </footer>
    </div>
  );
}
