// 접속자 정보를 모아두는 배열
const connections = []

const newConnection = ({ socketId, eno }) => {
    // console.log("# newConnection 실행!!!");
    const existConnection = connections.find(
        connection => connection.socketId === socketId)

    if (!socketId)
        return { error: "Socket ID를 입력해주세요." };
    if (existConnection)
        return { error: "이미 존재하는 Socket ID 입니다." };

    const connection = { socketId, eno };
    connections.push(connection);
    console.log("> connections : ", connections);

    return { connection };
}

const removeConnection = ({ socketId }) => {
    // console.log("# removeConnection 실행!!!");
    // console.log("# ", socketId);
    const existConnection = connections.find(
        connection => connection.socketId === socketId)

    if (!socketId)
        return { error: "Socket ID를 입력해주세요." };
    if (!existConnection)
        return { error: "존재하지 않는 Socket ID 입니다." };

    const index = connections.findIndex(
        connection => connection.socketId === socketId);
    // console.log(index);

    if (index !== -1) return { "connection": connections.splice(index, 1)[0] };
}

const getConnectionByEno = (eno) => {
    // console.log("# getConnectionByEno 실행!!!");
    // console.log("# eno : ", eno);
    return connections.find(connection => connection.eno === eno)
};

module.exports = { newConnection, removeConnection, getConnectionByEno };