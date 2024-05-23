import { Component, OnInit } from '@angular/core';
import { RegisterUserResponse } from '../models/register.models';
import { SessionService } from './../services/session.service';
import { SalaDataService } from '../services/sala-data.service';
import { forkJoin } from 'rxjs';
import { eachHourOfInterval, parseISO, addHours } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TelaPerfilComponent } from 'src/app/tela-perfil/tela-perfil.component';
import { TelaReservasComponent } from '../tela-reservas/tela-reservas.component';

class Reservation {
  _id: string = '';
  room_id: string = '';
  user_id: string = '';
  class_id: string = '';
  start_time: string = '';
  end_time: string = '';
  __v: number = 0;
}

interface ScheduleSlot {
  date: Date;
  classId: string;
  roomId: string;
}

@Component({
  selector: 'app-tela-mapa-horario-aulas',
  templateUrl: './tela-mapa-horario-aulas.component.html',
  styleUrls: ['./tela-mapa-horario-aulas.component.scss']
})
export class TelaMapaHorarioAulasComponent implements OnInit {
  public dataUser = <RegisterUserResponse>this.sessionService.getSessionData('user').retorno;
  public id = this.dataUser._id;
  public reservations: Reservation[] = [];
  public userReservations: Reservation[] = [];
  public schedule: ScheduleSlot[] = [];
  public classes: any[] = [];
  public rooms: any[] = [];
  public exceptions: any[] = [];

  public tableHours: string[] = Array.from({ length: 17 }, (_, i) => (i + 6 < 10 ? '0' : '') + (i + 6).toString());
  public daysOfWeek: string[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  constructor(
    private sessionService: SessionService,
    private salaDataService: SalaDataService,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    forkJoin({
      reservations: this.salaDataService.carregarDadosSalasReservadas(),
      classes: this.salaDataService.carregarDadosClasses(),
      rooms: this.salaDataService.carregarDadosSalas()
    }).subscribe(({ reservations, classes, rooms }) => {
      this.reservations = reservations;
      this.classes = classes;
      this.rooms = rooms;
      this.filterUserReservations();
    });
  }

  filterUserReservations() {
    this.userReservations = this.reservations.filter(reservation => reservation.user_id === this.id);
    this.processReservations();
  }

  processReservations() {
    this.schedule = this.userReservations.flatMap(reservation => {
      const startParts = reservation.start_time.split(' ');
      const endParts = reservation.end_time.split(' ');

      // Interpretando as partes da data
      const startYear = parseInt(startParts[3]);
      const startMonth = this.getMonthIndex(startParts[1]);
      const startDay = parseInt(startParts[2]);
      const startHour = parseInt(startParts[4].split(':')[0]);
      const startMinute = parseInt(startParts[4].split(':')[1]);
      const endYear = parseInt(endParts[3]);
      const endMonth = this.getMonthIndex(endParts[1]);
      const endDay = parseInt(endParts[2]);
      const endHour = parseInt(endParts[4].split(':')[0]);
      const endMinute = parseInt(endParts[4].split(':')[1]);

      // Criando objetos Date
      const start = new Date(startYear, startMonth, startDay, startHour, startMinute);
      const end = new Date(endYear, endMonth, endDay, endHour, endMinute);

      console.log(`Start Time (original): ${reservation.start_time}`);
      console.log(`End Time (original): ${reservation.end_time}`);
      console.log(`Start Time (Date object): ${start}`);
      console.log(`End Time (Date object): ${end}`);

      const slots = eachHourOfInterval({ start, end: addHours(end, -1) }).map(date => ({
        date,
        classId: reservation.class_id,
        roomId: reservation.room_id
      }));

      // Adicionar a última hora
      slots.push({
        date: end,
        classId: reservation.class_id,
        roomId: reservation.room_id
      });

      return slots;
    });
    console.log('Processed schedule:', this.schedule);
  }

  getMonthIndex(month: string): number {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.indexOf(month);
  }

  getReservation(day: string, hour: number): string {
    const reservation = this.schedule.find(slot => {
      const date = slot.date;
      return date.getHours() === hour && this.daysOfWeek[date.getDay() - 1] === day;
    });
    if (reservation) {
      const className = this.classes.find(cls => cls._id === reservation.classId)?.name || 'N/A';
      const roomNumber = this.rooms.find(room => room._id === reservation.roomId)?.number || 'N/A';
      return `${className}\nNº da Sala: ${roomNumber}`;
    }
    return '';
  }

  public redirectReserve() {
    const dialogT = this.dialog.open(TelaReservasComponent, {
      width: '400px',
    });
  }

  public redirectProfile() {
    const dialogT = this.dialog.open(TelaPerfilComponent, {
      width: '400px',
    });
    dialogT.afterClosed().subscribe(() => {
      this.dialogCloseSubs();
    });
  }

  private dialogCloseSubs() {
    this.router.navigate(['reload']);
  }
}
