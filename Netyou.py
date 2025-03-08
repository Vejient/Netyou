import os
import tkinter as tk
from tkinter import messagebox, ttk
import yt_dlp
from PIL import Image, ImageTk

class NetyouApp:
    def __init__(self):
        self.ventana = tk.Tk()
        self.ventana.title("Netyou")
        self.ventana.geometry(self.centrar_ventana(700, 500))
        self.ventana.resizable(False, False)

        # Configuración de rutas
        self.directorio_actual = os.path.dirname(__file__)
        self.configurar_rutas()

        # Agregar ffmpeg al PATH temporalmente
        ruta_ffmpeg = os.path.join(self.directorio_actual, "ffmpeg", "bin")
        os.environ["PATH"] += os.pathsep + ruta_ffmpeg

        # Variables de estado
        self.modo = tk.StringVar(value="video")
        self.calidad_var = tk.StringVar(value='Mejor calidad')
        self.calidades = [
            ('Mejor calidad', 'bestvideo+bestaudio'),
            ('720p', 'bestvideo[height<=720]+bestaudio/best[height<=720]'),
            ('480p', 'bestvideo[height<=480]+bestaudio/best[height<=480]')
        ]

        # Crear la interfaz gráfica
        self.crear_interfaz()

    def centrar_ventana(self, ancho, alto):
        x = (self.ventana.winfo_screenwidth() // 2) - (ancho // 2)
        y = (self.ventana.winfo_screenheight() // 2) - (alto // 2)
        return f"{ancho}x{alto}+{x}+{y}"

    def configurar_rutas(self):
        self.ruta_fondo = os.path.join(self.directorio_actual, "imagenes", "fondo.jpg")
        self.ruta_icono_descarga = os.path.join(self.directorio_actual, "iconos", "descarga.ico")
        self.ruta_icono_audio = os.path.join(self.directorio_actual, "iconos", "audio.ico")
        self.ruta_icono_video = os.path.join(self.directorio_actual, "iconos", "video.ico")
        self.ruta_icono_icono = os.path.join(self.directorio_actual, "iconos", "icono.ico")
        self.ruta_icono_acercade = os.path.join(self.directorio_actual, "iconos", "acerca-de.ico")

    def redimensionar_imagen(self, ruta, ancho, alto):
        imagen = Image.open(ruta)
        imagen = imagen.resize((ancho, alto), Image.LANCZOS)
        return ImageTk.PhotoImage(imagen)

    def mostrar_info(self):
        info_texto = """Netyou - Copyright (c) 2024 Arcanum
        Todos los derechos reservados.
        """
        messagebox.showinfo("Acerca de", info_texto)

    def guardar_ruta(self):
        carpeta = rf"C:\Users\{os.getlogin()}\Documents\azulas"
        if not os.path.exists(carpeta):
            os.makedirs(carpeta)

    def cambiar_modo(self):
        if self.modo.get() == "video":
            self.modo.set("audio")
            self.boton_cambiar.config(image=self.icono_audio)
            self.menu_calidad.config(state='disabled')  # Desactivar el menú de calidad
        else:
            self.modo.set("video")
            self.boton_cambiar.config(image=self.icono_video)
            self.menu_calidad.config(state='readonly')  # Activar el menú de calidad

    def convertir_tamano(self, bytes):
        for unidad in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes < 1024:
                return f"{bytes:.2f} {unidad}"
            bytes /= 1024

    def update_progress(self, current, total):
        self.progress['value'] = (current / total) * 100
        current_size = self.convertir_tamano(current)
        total_size = self.convertir_tamano(total)
        self.label_progress.config(text=f"Descargado: {current_size} / {total_size}")
        self.ventana.update_idletasks()

    def hook(self, d):
        if d['status'] == 'downloading':
            self.update_progress(d.get('downloaded_bytes', 0), d.get('total_bytes', 0))
        elif d['status'] == 'finished':
            self.label_progress.config(text="Descarga completada")

    def obtener_calidad(self):
        if self.modo.get() == "audio":
            return "bestaudio"
        else:
            seleccion = self.calidad_var.get()
            for nombre, valor in self.calidades:
                if nombre == seleccion:
                    return valor

    def descargar(self):
        url = self.entrada_url.get()
        guardar = rf"C:\Users\{os.getlogin()}\Documents\descargas"
        calidad = self.obtener_calidad()
        ydl_opts = {
            'format': calidad,
            'outtmpl': os.path.join(guardar, '%(title)s.%(ext)s'),
            'progress_hooks': [self.hook],
        }
        
        fallidos = []
        descargados = 0
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=False)
                total_videos = len(info_dict['entries']) if 'entries' in info_dict else 1
                self.label_total_videos.config(text=f"Descargado: 0 / {total_videos}")
                
                for entry in info_dict.get('entries', [info_dict]):
                    try:
                        ydl.download([entry['webpage_url']])
                        descargados += 1
                        self.label_total_videos.config(text=f"Descargado: {descargados} / {total_videos}")
                    except Exception as e:
                        print(f"Error al descargar {entry.get('title', 'Video sin título')}: {e}")
                        fallidos.append(entry.get('title', 'Video sin título'))
                
            messagebox.showinfo("Éxito", "Descarga completada.")
            if fallidos:
                messagebox.showwarning("Descargas fallidas", "No se pudieron descargar los siguientes videos:\n" + "\n".join(fallidos))
        except Exception as e:
            messagebox.showerror("Error", f"Error al descargar el video: {e}")

    def crear_interfaz(self):
        self.ventana.iconbitmap(self.ruta_icono_icono)

        # FONDO
        fondo = self.redimensionar_imagen(self.ruta_fondo, 700, 500)
        label_fondo = tk.Label(self.ventana, image=fondo)
        label_fondo.place(x=0, y=0, relwidth=1, relheight=1)

        self.icono_descarga = self.redimensionar_imagen(self.ruta_icono_descarga, 50, 50)
        self.icono_audio = self.redimensionar_imagen(self.ruta_icono_audio, 50, 50)
        self.icono_video = self.redimensionar_imagen(self.ruta_icono_video, 50, 50)
        self.icono_acercade = self.redimensionar_imagen(self.ruta_icono_acercade, 30, 30)

        transparente = Image.new('RGBA', (1, 1), (255, 255, 255, 0))
        transparente_img = ImageTk.PhotoImage(transparente)

        tk.Label(self.ventana, text="URL del video:", image=transparente_img, compound='center', bg='white', fg='black').place(x=10, y=10)
        tk.Label(self.ventana, text="Versión: 0.1", image=transparente_img, compound='center', bg='white', fg='black').place(x=15, y=470)
        
        self.entrada_url = tk.Entry(self.ventana, width=70, bg='white', fg='black')
        self.entrada_url.place(x=120, y=10)
        
        tk.Button(self.ventana, image=self.icono_descarga, command=self.descargar, border=0).place(x=140, y=50)
        self.boton_cambiar = tk.Button(self.ventana, image=self.icono_video, command=self.cambiar_modo, compound='center', bg='white', fg='black')
        self.boton_cambiar.place(x=265, y=50)
        
        # Barra de progreso
        self.progress = ttk.Progressbar(self.ventana, orient="horizontal", length=555, mode="determinate")
        self.progress.place(x=100, y=470)
        
                # Continuación de la creación de la interfaz
        self.label_progress = tk.Label(self.ventana, text="Descarga: 0/0", bg='white', fg='black')
        self.label_progress.place(x=110, y=440)

        # Etiqueta para mostrar el progreso de la descarga
        self.label_total_videos = tk.Label(self.ventana, text="Elementos: 0 / 0", bg='white', fg='black')
        self.label_total_videos.place(x=550, y=440)

        tk.Button(self.ventana, image=self.icono_acercade, command=self.mostrar_info, compound='center', bg='white', fg='black').place(x=600, y=10)

        # Menú desplegable para seleccionar la calidad
        self.menu_calidad = ttk.Combobox(self.ventana, textvariable=self.calidad_var, values=[c[0] for c in self.calidades], state='readonly')
        self.menu_calidad.place(x=350, y=50)

        # Llama a la función para crear la carpeta de descargas si no existe
        self.guardar_ruta()

        # Iniciar el bucle principal de la ventana
        self.ventana.mainloop()


# Iniciar la aplicación
if __name__ == "__main__":
    app = NetyouApp()

