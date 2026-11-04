// Terra de Crinas (computador): ponto de entrada.
// Uso: TerraDeCrinas [--shot captura.png --scene menu|create|choose|play|ride|gallop|sheet|herd --hour h --size LxA]
namespace Crinas
{
    public static class Program
    {
        [System.STAThread]
        static void Main(string[] args) { using (var g = new GameRoot(args)) g.Run(); }
    }
}
