
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class BookingGateway {
    @WebSocketServer()
    server: Server;

    notifyNewBooking(booking: any) {
        this.server.emit('newBooking', booking);
    }

    @SubscribeMessage('joinTenant')
    handleJoinTenant(@MessageBody() tenantId: string) {
        // Logic to join specific room if implementing targeted notifications
        // client.join(`tenant-${tenantId}`);
    }
}
