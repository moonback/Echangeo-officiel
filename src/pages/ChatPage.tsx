import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useConversation, useSendMessage } from '../hooks/useMessages';
import { useProfile } from '../hooks/useProfiles';
import { useAuthStore } from '../store/authStore';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const { data: messages, isLoading } = useConversation(id);
  const { data: otherProfile } = useProfile(id);
  const sendMessage = useSendMessage();
  const { user } = useAuthStore();

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !content.trim()) return;
    await sendMessage.mutateAsync({ receiver_id: id, content });
    setContent('');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {otherProfile?.full_name || otherProfile?.email || 'Chat'}
        </h1>

          <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-[70vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && (
              <div className="text-gray-500 text-sm">Chargement…</div>
            )}
            {!isLoading && messages?.length === 0 && (
              <div className="text-gray-500 text-sm">Aucun message pour le moment.</div>
            )}

            {messages?.map((m) => {
              const own = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`${own ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} max-w-[75%] rounded-2xl px-3 py-2`}
                    aria-label={own ? 'Message envoyé' : 'Message reçu'}
                  >
                    <div className="text-sm">{m.content}</div>
                    <div className={`text-[10px] opacity-70 mt-1 ${own ? 'text-white/80' : 'text-gray-600'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={onSend} className="border-t border-gray-200 p-3 flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrire un message…"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={sendMessage.isPending || !content.trim()}
              className="rounded-full bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
            >
              Envoyer
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPage;