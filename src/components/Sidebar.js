import React, { useCallback, useContext, useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";

function Sidebar() {
  const user = useSelector((state) => state.user);
  const {
    socket,
    setMembers,
    members,
    setCurrentRoom,
    setRooms,
    rooms,
    privateMemberMsg,
    setPrivateMemberMsg,
    currentRoom,
  } = useContext(AppContext);

  function joinRoom(room, isPublic = true) {
    if (!user) {
      return alert("Please Login.");
    }
    socket.emit("join-room", room, currentRoom);
    setCurrentRoom(room);
    console.log(room, currentRoom)

    if (isPublic) {
      setPrivateMemberMsg(null);
    }
    // dispatch for notification
    // dispatch(resetNotifications(room))
  }
  const getRooms = useCallback(() => {
    fetch("http://localhost:5001/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, [setRooms]);

  useEffect(() => {
    if (user) {
      setCurrentRoom("general");
      getRooms();
      socket.emit("join-room", "general");
      // new-user trae del back a todos los members del socket
      socket.emit("new-user");
    }
  }, [getRooms, setCurrentRoom, socket, user]);

  // payload trae todos los members desde el back
  socket.off("new-user").on("new-user", (payload) => {
    setMembers(payload);
  });

  if (!user) {
    return <h4>No available rooms for guest users.</h4>;
  }

  return (
    <>
      <h2>Available rooms</h2>
      <ListGroup>
        {rooms.map((room, idx) => (
          <ListGroup.Item
            key={idx}
            onClick={() => joinRoom(room)}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
            active={room === currentRoom}
          >
            {room} {currentRoom !== room && <span></span>}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <h2>Members</h2>
      {members.map((member) => (
        <ListGroup.Item key={member.id} style={{ cursor: "pointer" }}>
          {member.name}
        </ListGroup.Item>
      ))}
    </>
  );
}

export default Sidebar;
