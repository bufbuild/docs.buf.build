import React from 'react';

import styles from './styles.module.css';

type LanguageProps = {
  name: string;
  logos: string[];
  href: string;
};

const languages: LanguageProps[] = [
  {
    name: "Go",
    logos: ["/img/logos/go.svg"],
    href: "./go"
  },
  {
    name: "JavaScript and TypeScript",
    logos: ["/img/logos/js.svg", "/img/logos/ts.svg"],
    href: "./js"
  },
  {
    name: "Archive",
    logos: ["/img/logos/js.svg"],
    href: "./archive"
  }
];

const Language = ({ name, logos, href }: LanguageProps) => {
  return (
    <a href={href} className={styles.language}>
      <div className={styles.logos}>
        {logos.map((logo) => (
          <img alt={`Logo for ${name}`} src={logo} className={styles.logo} />
        ))}
      </div>

      <span className={styles.title}>{name}</span>
    </a>
  );
};

const BsrLanguages = () => {
  return (
    <div className={styles.languages}>
      {languages.map((language) => (
        <Language {...language} />
      ))}
    </div>
  );
};

export default BsrLanguages;
