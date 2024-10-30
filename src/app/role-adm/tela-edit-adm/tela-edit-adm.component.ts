import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProfessorModel } from 'src/app/models/professor.model';
import { CadastroService } from 'src/app/services/cadastros.service';

@Component({
  selector: 'app-tela-edit-adm',
  templateUrl: './tela-edit-adm.component.html',
  styleUrls: ['./tela-edit-adm.component.scss'],
})
export class TelaEditAdmComponent implements OnInit {
  public cadastroProfessorAdmForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cadastroService: CadastroService,
    private router: Router,
    public dialogRef: MatDialogRef<TelaEditAdmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfessorModel
  ) {
    this.cadastroProfessorAdmForm = this.fb.group(
      {
        nome: ['', [Validators.required]],
        email: ['', [Validators.required, this.emailValidator]],
        registro: ['', [Validators.required]],
        adm: [true],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit() {}

  edit() {
    if (this.cadastroProfessorAdmForm.invalid) {
      return;
    }

    this.data.nome = this.cadastroProfessorAdmForm.get('nome')?.value;
    this.data.email = this.cadastroProfessorAdmForm.get('email')?.value;
    this.data.registro = this.cadastroProfessorAdmForm.get('registro')?.value;
    this.data.adm = this.cadastroProfessorAdmForm.get('adm')?.value;

    this.cadastroService.atualizarProfessor(this.data).subscribe({
      next: () => {
        this.snackBar.open('Dados atualizados com sucesso.', '', {
          duration: 3000,
        });
        this.dialogRef.close();
        this.resetForms(this.cadastroProfessorAdmForm);
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['home-adm']);
          });
      },
      error: (err) => {
        this.snackBar.open('Ocorreu um erro durante sua solicitação.', '', {
          duration: 3000,
        });
        this.dialogRef.close();
      },
    });

    this.router.navigate(['home-adm']);
  }

  private resetForms(form: FormGroup): void {
    form.reset();

    Object.keys(form.controls).forEach((controlName) => {
      const control = form.get(controlName);
      control?.setErrors(null);
      control?.markAsUntouched();
    });
  }

  private emailValidator(control: any) {
    const value = control.value;
    const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (value && !pattern.test(value)) {
      return { email: true };
    }
    return null;
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
