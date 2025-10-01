import Select from "react-select";
import Layout from "../Layout";
import type { Template } from "../../types/bingo";

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

  return (
    <Layout>
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Create Room */}
        <div className="space-y-4 rounded border border-neutral-200 p-4">
          <h2 className="text-xl font-semibold">Create new room</h2>
          <p className="text-sm text-gray-600">
            Set up a new multiplayer bingo room
          </p>

          <div>
            <p className="mb-1 text-sm font-medium">Room name (optional)</p>
            <input
              type="text"
              value={createRoomName}
              onChange={(e) => setCreateRoomName(e.target.value)}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="My Bingo Game"
              disabled={roomId !== null}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Select template</p>
            <Select
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  fontSize: "0.875rem",
                  backgroundColor: state.isSelected
                    ? "#c7d2fe"
                    : state.isFocused
                      ? "#e0e7ff"
                      : "white",
                  color: "black",
                }),
                control: (provided) => ({
                  ...provided,
                  fontSize: "0.875rem",
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  fontSize: "0.875rem",
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
                label: `${template.name} (${template.size}x${template.size})`,
              }))}
              onChange={(option) => {
                if (option) setSelectedTemplate(option.value);
              }}
              placeholder="Select a template"
              isSearchable={false}
              isDisabled={roomId !== null}
              menuPortalTarget={document.body}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Your name</p>
            <input
              type="text"
              value={createPlayerName}
              onChange={(e) => setCreatePlayerName(e.target.value)}
              className="w-full rounded border border-gray-200 bg-white p-2 text-sm placeholder:text-sm"
              placeholder="Enter your name"
              disabled={roomId !== null}
            />
          </div>

          <button
            onClick={onCreateRoom}
            disabled={
              roomId !== null ||
              !createPlayerName.trim() ||
              selectedTemplate === null
            }
            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {roomId ? "Creating..." : "Create Room"}
          </button>
        </div>

        {/* Join Room */}
        <div className="space-y-4 rounded border border-neutral-200 p-4">
          <h2 className="text-xl font-semibold">Join Existing Room</h2>
          <p className="text-sm text-gray-600">
            Enter the room code to join an existing game
          </p>

          <div>
            <p className="mb-1 text-sm font-medium">Room code</p>
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="e.g. AB12CD"
              maxLength={6}
              disabled={roomId !== null}
            />
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">Your name</p>
            <input
              type="text"
              value={joinPlayerName}
              onChange={(e) => setJoinPlayerName(e.target.value)}
              className="w-full rounded border border-gray-200 p-2 text-sm placeholder:text-sm"
              placeholder="John Doe"
              disabled={roomId !== null}
            />
          </div>

          <button
            onClick={onJoinRoom}
            disabled={
              roomId !== null || !joinPlayerName.trim() || !joinRoomCode.trim()
            }
            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {roomId ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default InitialView;
