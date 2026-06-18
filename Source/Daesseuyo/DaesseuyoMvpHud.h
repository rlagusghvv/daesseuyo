#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "DaesseuyoMvpHud.generated.h"

class ADaesseuyoMvpPawn;
class UTexture2D;

UCLASS()
class DAESSEUYO_API ADaesseuyoMvpHud : public AHUD
{
	GENERATED_BODY()

public:
	virtual void DrawHUD() override;

private:
	UPROPERTY()
	UTexture2D* StadiumTexture = nullptr;

	UPROPERTY()
	UTexture2D* BatterCutoutTexture = nullptr;

	UPROPERTY()
	UTexture2D* PitcherCutoutTexture = nullptr;

	UPROPERTY()
	UTexture2D* CatcherCutoutTexture = nullptr;

	UPROPERTY()
	UTexture2D* BaseballTexture = nullptr;

	bool bTriedLoadingGeneratedAssets = false;

	void EnsureGeneratedAssetsLoaded();
	UTexture2D* LoadTextureFromProjectFile(const FString& RelativePath) const;
	void DrawGeneratedAtBatLayer(const ADaesseuyoMvpPawn* MvpPawn);
	void DrawTexture(UTexture2D* Texture, const FVector2D& Position, const FVector2D& Size, const FLinearColor& Color = FLinearColor::White) const;
	FVector2D ProjectPitchPointToHud(const FVector& WorldPosition) const;
};
