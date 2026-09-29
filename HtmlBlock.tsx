/**
 * components/external/HtmlBlock.tsx
 * ------------------------------------------------------------------
 * Point d'entrée des designs externes (Figma / Locofy / v0 / HTML brut).
 *
 *  Méthode 3 du guide d'import : on colle le code HTML/CSS généré par
 *  l'outil de maquettage, et il s'intègre dans la charte Maniguadebaby
 *  sans toucher au reste de l'application.
 *
 *  Usage :
 *    <HtmlBlock html={figmaHtml} css={figmaCss} className="my-8" />
 *
 *  ⚠️ Contenu de confiance uniquement : ce bloc est collé par l'équipe,
 *  jamais alimenté par un visiteur.
 */

export type HtmlBlockProps = {
  /** HTML exporté depuis l'outil de design (section complète). */
  html: string;
  /** CSS associé, optionnel — il est injecté dans une balise dédiée. */
  css?: string;
  /** Styles utilitaires Tailwind pour l'encadrer (marges, largeur…). */
  className?: string;
  /** Id unique requis si la page contient plusieurs blocs avec du CSS. */
  blockId?: string;
};

export function HtmlBlock({ html, css, className = "", blockId = "external-block" }: HtmlBlockProps) {
  return (
    <div className={`external-block ${className}`}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} data-block={blockId} /> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default HtmlBlock;
