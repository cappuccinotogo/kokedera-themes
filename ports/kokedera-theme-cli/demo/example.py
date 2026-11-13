"""A quiet path through the moss temple."""
from dataclasses import dataclass

@dataclass
class Lantern:
    name: str
    lit: bool = False

    def light(self) -> str:
        self.lit = True
        return f"{self.name}: warm light"

lanterns = [Lantern(f"Path {i}") for i in range(3)]
for lantern in lanterns:
    print(lantern.light())
