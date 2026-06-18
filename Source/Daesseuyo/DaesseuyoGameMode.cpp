#include "DaesseuyoGameMode.h"
#include "DaesseuyoMvpHud.h"
#include "DaesseuyoMvpPawn.h"

ADaesseuyoGameMode::ADaesseuyoGameMode()
{
	DefaultPawnClass = ADaesseuyoMvpPawn::StaticClass();
	HUDClass = ADaesseuyoMvpHud::StaticClass();
}
