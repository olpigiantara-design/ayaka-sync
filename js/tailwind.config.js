tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            colors: {
                neo: {
                    bg: '#EBF4FF',
                    card: '#FFFFFF',
                    accentBlue: '#2563EB',
                    lightBlue: '#93C5FD',
                    softCyan: '#BAE6FD',
                    yellow: '#FDE047',
                    border: '#0F172A',
                    text: '#0F172A',
                    terminal: '#090D16'
                }
            },
            boxShadow: {
                'neo': '4px 4px 0px #0F172A',
                'neo-lg': '6px 6px 0px #0F172A',
                'neo-sm': '2px 2px 0px #0F172A',
                'neo-inset': 'inset 3px 3px 0px #0F172A'
            }
        }
    }
};