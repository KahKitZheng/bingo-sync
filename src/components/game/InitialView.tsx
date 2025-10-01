import Select from "react-select";
import Layout from "../Layout";
import type { Template } from "../../types/bingo";
import { Users, Plus, LogIn, Sparkles } from "lucide-react";

type InitialViewProps = {
  error: string | null;
  roomId: string | null;
  templates: Template[];
  selectedTemplate: number | null;
  setSelectedTemplate: (id: number | null) => void;
  createRoomName: string;
  setCreateRoomName: (name: string) => void;
  createPlayerName: string;
  setCreatePlayerName: (name: string) => void;
  joinRoomCode: string;
  setJoinRoomCode: (code: string) => void;
  joinPlayerName: string;
  setJoinPlayerName: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
};

export function InitialView(props: InitialViewProps) {
  const {
    error,
    roomId,
    templates,
    selectedTemplate,
    setSelectedTemplate,
    createRoomName,
    setCreateRoomName,
    createPlayerName,
    setCreatePlayerName,
    joinRoomCode,
    setJoinRoomCode,
    joinPlayerName,
    setJoinPlayerName,
    onCreateRoom,
    onJoinRoom,
  } = props;

  const isCreating = roomId !== null;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-indigo-500" />
          <h1 className="text-4xl font-bold text-gray-900">
            Multiplayer Bingo
          </h1>
          <Sparkles className="h-8 w-8 text-indigo-500" />
        </div>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Create a custom bingo game or join an existing one. Play with friends
          in real-time!
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Room Card */}
        <div className="group relative flex overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-indigo-300 hover:shadow-xl">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-50 opacity-50 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 rounded-full bg-purple-50 opacity-50 transition-transform duration-300 group-hover:scale-110" />

          <div className="relative flex w-full flex-col space-y-6 p-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create New Room
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Set up a custom bingo game and invite friends
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Room Name{" "}
                  <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={createRoomName}
                  onChange={(e) => setCreateRoomName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="e.g., Friday Night Bingo"
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Template
                </label>
                <Select
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderRadius: "0.75rem",
                      borderWidth: "2px",
                      borderColor: state.isFocused ? "#6366f1" : "#e5e7eb",
                      padding: "0.25rem",
                      boxShadow: state.isFocused
                        ? "0 0 0 3px rgba(99, 102, 241, 0.1)"
                        : "none",
                      "&:hover": {
                        borderColor: "#6366f1",
                      },
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected
                        ? "#6366f1"
                        : state.isFocused
                          ? "#eef2ff"
                          : "white",
                      color: state.isSelected ? "white" : "#1f2937",
                      cursor: "pointer",
                      "&:active": {
                        backgroundColor: "#4f46e5",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    placeholder: (provided) => ({
                      ...provided,
                      color: "#9ca3af",
                    }),
                  }}
                  value={
                    selectedTemplate !== null
                      ? {
                          value: selectedTemplate,
                          label:
                            templates.find((t) => t.id === selectedTemplate)
                              ?.name || "Select template",
                        }
                      : null
                  }
                  options={templates.map((template) => ({
                    value: template.id,
                    label: `${template.name} (${template.size}×${template.size})`,
                  }))}
                  onChange={(option) => {
                    if (option) setSelectedTemplate(option.value);
                  }}
                  placeholder="Choose a bingo template"
                  isSearchable={false}
                  isDisabled={isCreating}
                  menuPortalTarget={document.body}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={createPlayerName}
                  onChange={(e) => setCreatePlayerName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your name"
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={onCreateRoom}
              disabled={
                isCreating ||
                !createPlayerName.trim() ||
                selectedTemplate === null
              }
              className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover/btn:opacity-100" />
              <div className="relative flex items-center justify-center gap-2">
                {isCreating ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Room
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Join Room Card */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-emerald-300 hover:shadow-xl">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-50 opacity-50 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-8 translate-y-8 rounded-full bg-teal-50 opacity-50 transition-transform duration-300 group-hover:scale-110" />

          <div className="relative space-y-6 p-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <LogIn className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Join Room</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter a room code to join an existing game
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) =>
                    setJoinRoomCode(e.target.value.toUpperCase())
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-wider text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={isCreating}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Get the code from your host
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  value={joinPlayerName}
                  onChange={(e) => setJoinPlayerName(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your name"
                  disabled={isCreating}
                />
              </div>

              {/* Empty space for alignment */}
              <div className="h-[88px]" />
            </div>

            {/* Submit Button */}
            <button
              onClick={onJoinRoom}
              disabled={
                isCreating || !joinPlayerName.trim() || !joinRoomCode.trim()
              }
              className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover/btn:opacity-100" />
              <div className="relative flex items-center justify-center gap-2">
                {isCreating ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Joining Room...
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    Join Room
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default InitialView;
