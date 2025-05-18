"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

export default function TestPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      else setData(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url) return alert("Please enter both title and URL");
    setAdding(true);
    const { data: newLink, error } = await supabase
      .from("links")
      .insert([{ title, url }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error adding link");
    } else {
      setData((prev) => [newLink, ...prev]);
      setTitle("");
      setUrl("");
    }
    setAdding(false);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Are you sure you want to delete this link?");
    if (!confirmed) return;

    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Failed to delete the link.");
    } else {
      setData((prev) => prev.filter((link) => link.id !== id));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📚 LinkVault</h1>

      <form onSubmit={handleAddLink} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={adding}
          className="border p-2 flex-1 rounded"
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={adding}
          className="border p-2 flex-1 rounded"
        />
        <motion.button
          type="submit"
          disabled={adding}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          whileTap={{ scale: 0.95 }}
        >
          {adding ? "Adding..." : "Add Link"}
        </motion.button>
      </form>

      <ul className="space-y-4">
        <AnimatePresence>
          {data.map((link) => (
            <motion.li
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="border p-4 rounded shadow-sm hover:shadow-md transition flex justify-between items-center"
              layout
            >
              <div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {link.title}
                </a>
                <p className="text-sm text-gray-500 mt-1">{link.url}</p>
              </div>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-red-500 hover:text-red-700 text-sm cursor-pointer ml-4"
              >
                Delete
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
