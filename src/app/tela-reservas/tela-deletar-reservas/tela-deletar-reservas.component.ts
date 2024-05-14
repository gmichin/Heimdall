import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TelaLoginCadastroComponent } from 'src/app/tela-login-cadastro/tela-login-cadastro.component';
import { TelaReservasComponent } from '../tela-reservas.component';
import { SalaDataService } from 'src/app/services/sala-data.service';
import { SelectionModel } from '@angular/cdk/collections';
import { TelaSalasComponent } from 'src/app/tela-salas/tela-salas.component';

interface Sala {
  _id: string;
  room_id: string;
  user_id: string;
  class_id: string;
  start_time: string;
  end_time: string;
}

@Component({
  selector: 'app-tela-deletar-reservas',
  templateUrl: './tela-deletar-reservas.component.html',
  styleUrl: './tela-deletar-reservas.component.scss'
})
export class TelaDeletarReservasComponent {
  escolha: string = ''; 
  sala: string = ''; 
  salaSelecionada: string = '';

  idProfessores: string[] = [];
  professorNomes: string[] = [];

  idSalaReservada: string[] = [];
  numeroSala: string[] = [];

  materia: string[] = [];
  dia: string[] = [];
  reservasAchadas: Sala[] = [];
  todasReservas: any[] = [];

  displayedColumns: string[] = ['selecionar','numero', 'professor', 'materia', 'dia', 'remove'];

  selection = new SelectionModel<any>(true, []);

  constructor(
    public dialog: MatDialog,
    private salaDataService: SalaDataService
  ) {
    this.salaDataService.salaReservaData$.subscribe((salas) => {
      this.idSalaReservada = salas.map((sala) => sala.room_id);
      this.numeroReservas();
    });

    this.salaDataService.salaReservaData$.subscribe((salas) => {
      this.idProfessores = salas.map((sala) => sala.user_id);
      console.log(this.idProfessores);
      this.nomeProfessores();
    });

    this.salaDataService.salaReservaData$.subscribe((salas) => {
      this.materia = salas.map((sala) => sala.class_id);
    });


    this.salaDataService.salaReservaData$.subscribe((salas) => {
      this.dia = salas.map((sala) => sala.start_time);
    });
    this.salaDataService.salaReservaData$.subscribe((salas) => {
      this.todasReservas = salas;
    })
  }
  nomeProfessores(){
    this.salaDataService.teacherData$.subscribe((teachers) => {
      const professoresFiltradas = teachers.filter((teacher) => this.idProfessores.includes(teacher._id));
      console.log(professoresFiltradas);
      this.numeroSala = professoresFiltradas.map((teacher) => teacher.name);
    });
  }
  numeroReservas(){
    this.salaDataService.salaData$.subscribe((salas) => {
      const salasFiltradas = salas.filter((sala) => this.idSalaReservada.includes(sala._id));
      this.numeroSala = salasFiltradas.map((sala) => sala.number);
    });
  }
  openLoginSignUp() {
    const dialogRef = this.dialog.open(TelaLoginCadastroComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
  openReservas() {
    const dialogRef = this.dialog.open(TelaReservasComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openSalas() {
    const dialogRef = this.dialog.open(TelaSalasComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
  
  procurarSala(selectedValue: string){
    this.reservasAchadas = [];
    this.todasReservas.forEach(reserva => {
      if (reserva.room_id === selectedValue ||
          reserva.user_id === selectedValue ||
          reserva.class_id === selectedValue ||
          reserva.start_time === selectedValue) {
          this.reservasAchadas.push(reserva);
      }
    });
  }
  
  removeRow(sala: Sala){
    const index = this.reservasAchadas.findIndex(item => item === sala);
    
    if (index !== -1) {
      this.reservasAchadas.splice(index, 1);
    }
  }

  deleteReserva(){
    console.log(this.reservasAchadas);
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.reservasAchadas.forEach(row => this.selection.select(row));
  }
  
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.reservasAchadas.length;
    return numSelected === numRows;
  }
}
