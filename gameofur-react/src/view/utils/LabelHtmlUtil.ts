import parse from 'html-react-parser'

export class LabelHtmlUtil {
    private static EXTRACT_LETTER = /&(\w)/;

    public static applyUnderline(inputText: string) {
        return parse(inputText.replace(LabelHtmlUtil.EXTRACT_LETTER, "<u>$1</u>"));
    }
}

export default LabelHtmlUtil;