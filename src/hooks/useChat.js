import {useEffect, useRef, useState} from 'react'
// получаем класс IO
import io from 'socket.io-client'
import {nanoid} from 'nanoid'
//хуки
import {useLocalStorage, useBeforeUnload} from 'hooks'

//адрес сервера
// тоебуется перенаправление запросов - ниже

const SERVER_URL = 'http://localhost:50001'

// хук принимает название комнаты

export const useChat = (roomId) => {
    // локальное состояние для пользовтелей
    const [users, setUsers] = useState([])
    // локальное состояние для сообщений
    const [messages, setMessages] = useState([])

    // создаем и записываем в локальное хранилище идентификатор пользователя
    const [userId] = useLocalStorage('userId', nanoid(8))
    // получаем из локального хранилища имя пользователя
    const [username] = useLocalStorage('username')

    // useRef() используется не только для получения доступа к DOM-элементам,
    // но и для хранения любых мутирующих значений в течение всего жизненного цикла компонента
    const socketRef = useRef(null)

    useEffect(() => {
            // создаем экземпляр сокета, передаем ему адрес сервера
            // и записываем объект с названием комнаты в строку запроса "рукопожатия"
            // socket.handshake.query.roomId
            socketRef.current = io(SERVER_URL, {
                query: {roomId}
            })


            // отправляем событие добавления пользователя
            // в качетстве данных передаем объекты с именем id пользователя
            socketRef.current.emit('user:add', {username, userId})

            // обрабатываем получение списка пользователей
            socketRef.current.on('user', (user) => {
                // обновляем массив пользователей
                setUsers(users)
            })

            // отправляем запрос на получение сообщений
            socketRef.current.emit("message:get")

            // обрабатываем получение сообщений
            socketRef.current.on('messages', (messages) => {
                const newMessages = messages.map((msg) =>
                    msg.userId === userId ? {...msg, currentUser: true} : msg
                )
                // обновляем массив сообщений
                setMessages(newMessages)
            })
            return () => {
                // при размонтировании компонента выполняем отключение сокета
                socketRef.current.disconnect()
            }
        },
        [roomId, userId, username])

    // функция отправки сообщения
    // принимает объект с текстом сообщения и именем отправителя
    const sendMessage = ({messageText, senderName}) => {
        // добавляем в объект id пользователя при отправке на сервер
        socketRef.current.emit('message:add', {
            userId,
            messageText,
            senderName
        })
    }

    //функция удаления сообщения по id
    const removeMessage = (id) => {
        socketRef.current.emit('message:remove', {id})
    }

    //отправляем на сервер события "user:leave"  перед перезагрузкой страницы
    useBeforeUnload(()=>{
        socketRef.current.emit('user:leave', userId)
    })

    return { users, messages, sendMessage, removeMessage }


}


