import type { CSSProperties } from 'react';

const Footer = () => {
    return (
        <footer className="footer" style={styles.footer}>
            <div className="footer-inner" style={styles.footerInner}>
                <div>© {new Date().getFullYear()} Edu2Job</div>
                <div className="footer-links" style={styles.footerLinks}>
                    <a href="#privacy" style={styles.link}>Privacy</a>
                    <a href="#terms" style={styles.link}>Terms</a>
                </div>
            </div>
        </footer>
    )
};

const styles: { [key: string]: CSSProperties } = {
    footer: {
        backgroundColor: '#1e3a8a', // Deep blue
        color: 'white',
        marginTop: '15px',
        height: '60px',
    },
    footerInner: {
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    footerLinks: {
        display: 'flex',
        gap: '1.5rem',
        marginLeft: '1.5rem',
        marginRight: '1.5rem',
    },
    link: {
        color: '#fff', // Light blue
        textDecoration: 'none',
        fontSize: '1rem',
        transition: 'color 0.2s',
    },
};

export default Footer;