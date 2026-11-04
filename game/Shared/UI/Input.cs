// Terra de Crinas — entrada unificada: teclado, mouse e toque (vários dedos), com joystick virtual e botões.
using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Input.Touch;

namespace Crinas.UI
{
    public struct Pointer { public int Id; public Vector2 P; public bool Down, Pressed; }

    public sealed class InputState
    {
        public readonly List<Pointer> Ptrs = new List<Pointer>();
        public KeyboardState Kb, KbPrev; MouseState mPrev;
        public int Wheel;
        public bool TouchUsed;     // já tocou na tela (mostra os controles de toque)
        // joystick virtual
        public Vector2 JoyHome, JoyC, JoyV; public int JoyId = -1; public float JoyR = 60;
        readonly HashSet<int> consumed = new HashSet<int>();

        public void Read()
        {
            KbPrev = Kb; Kb = Keyboard.GetState(); Ptrs.Clear(); consumed.Clear(); Wheel = 0;
            foreach (var t in TouchPanel.GetState())
                if (t.State != TouchLocationState.Released && t.State != TouchLocationState.Invalid) { Ptrs.Add(new Pointer { Id = t.Id, P = t.Position, Down = true, Pressed = t.State == TouchLocationState.Pressed }); TouchUsed = true; }
            if (!OperatingSystem.IsAndroid())
            {
                var ms = Mouse.GetState(); bool d = ms.LeftButton == ButtonState.Pressed;
                if (d) Ptrs.Add(new Pointer { Id = -100, P = new Vector2(ms.X, ms.Y), Down = true, Pressed = mPrev.LeftButton != ButtonState.Pressed });
                Wheel = ms.ScrollWheelValue - mPrev.ScrollWheelValue; mPrev = ms;
            }
        }

        public bool Key(Keys k) => Kb.IsKeyDown(k);
        public bool Hit(Keys k) => Kb.IsKeyDown(k) && !KbPrev.IsKeyDown(k);

        /// <summary>Algum dedo/clique acabou de tocar no retângulo? (consome o toque)</summary>
        public bool Tap(Rectangle r)
        {
            foreach (var p in Ptrs) if (p.Pressed && !consumed.Contains(p.Id) && r.Contains(p.P)) { consumed.Add(p.Id); return true; }
            return false;
        }
        /// <summary>Algum dedo está segurando o retângulo?</summary>
        public bool Hold(Rectangle r) { foreach (var p in Ptrs) if (p.Down && p.Id != JoyId && r.Contains(p.P)) { consumed.Add(p.Id); return true; } return false; }

        /// <summary>Joystick: começa onde o dedo encostar na metade esquerda; devolve vetor (0..1).</summary>
        public Vector2 Joystick(int screenW)
        {
            bool alive = false;
            foreach (var p in Ptrs)
            {
                if (p.Id == JoyId) { alive = true; Move(p.P); continue; }
                if (JoyId < 0 && p.Pressed && !consumed.Contains(p.Id) && (p.P.X < screenW * 0.42f || Vector2.Distance(p.P, JoyHome) < JoyR * 1.4f))
                { JoyId = p.Id; JoyC = Vector2.Distance(p.P, JoyHome) < JoyR * 1.4f ? JoyHome : p.P; alive = true; Move(p.P); consumed.Add(p.Id); }
            }
            if (!alive) { JoyId = -1; JoyV = Vector2.Zero; }
            return JoyV;
        }
        void Move(Vector2 p) { var d = (p - JoyC) / (JoyR * 0.8f); if (d.Length() > 1) d.Normalize(); JoyV = d; }
    }
}
