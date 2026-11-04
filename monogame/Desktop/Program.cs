// Lida no Sertão (MonoGame, desktop): ponto de entrada.
// Uso: LidaNoSertao [--shot captura.png --at x,y --hour h --season 0|1]
namespace Lida
{
    public static class Program
    {
        [System.STAThread]
        static void Main(string[] args) { using (var g = new LidaGame(args)) g.Run(); }
    }
}
