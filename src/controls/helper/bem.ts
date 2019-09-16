export function modificator(s: string): string {
    return s.toLowerCase().replace(/\s/g, "-");
}
