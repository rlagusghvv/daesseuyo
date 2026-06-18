#include "DaesseuyoMvpHud.h"
#include "DaesseuyoMvpPawn.h"
#include "CanvasItem.h"
#include "Engine/Canvas.h"
#include "Engine/Engine.h"
#include "Engine/Font.h"
#include "Engine/Texture2D.h"
#include "GameFramework/PlayerController.h"
#include "IImageWrapper.h"
#include "IImageWrapperModule.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Modules/ModuleManager.h"

void ADaesseuyoMvpHud::DrawHUD()
{
	Super::DrawHUD();

	if (!Canvas)
	{
		return;
	}

	TArray<FString> Lines;
	const ADaesseuyoMvpPawn* MvpPawn = nullptr;
	if (const APlayerController* PlayerController = GetOwningPlayerController())
	{
		MvpPawn = Cast<ADaesseuyoMvpPawn>(PlayerController->GetPawn());
		if (MvpPawn)
		{
			MvpPawn->GetMvpHudLines(Lines);
		}
	}

	if (Lines.IsEmpty())
	{
		Lines.Add(TEXT("대쓰요 : real BaseBall"));
		Lines.Add(TEXT("Pawn을 기다리는 중입니다."));
	}

	DrawGeneratedAtBatLayer(MvpPawn);

	const float SafeX = 34.0f;
	const float SafeY = 28.0f;
	const float PanelWidth = FMath::Min(620.0f, Canvas->ClipX - SafeX * 2.0f);
	const float PanelHeight = 208.0f;

	FCanvasTileItem Panel(FVector2D(SafeX - 14.0f, SafeY - 14.0f), FVector2D(PanelWidth, PanelHeight), FLinearColor(0.0f, 0.0f, 0.0f, 0.66f));
	Panel.BlendMode = SE_BLEND_Translucent;
	Canvas->DrawItem(Panel);

	UFont* LargeFont = GEngine ? GEngine->GetLargeFont() : nullptr;
	UFont* MediumFont = GEngine ? GEngine->GetMediumFont() : nullptr;
	UFont* SmallFont = GEngine ? GEngine->GetSmallFont() : nullptr;

	DrawText(Lines[0], FLinearColor(1.0f, 0.78f, 0.16f, 1.0f), SafeX, SafeY, LargeFont, 1.05f, false);

	float Y = SafeY + 38.0f;
	for (int32 LineIndex = 1; LineIndex < Lines.Num(); ++LineIndex)
	{
		const bool bResultLine = LineIndex == Lines.Num() - 1;
		const FLinearColor Color = bResultLine ? FLinearColor(0.52f, 0.88f, 1.0f, 1.0f) : FLinearColor::White;
		DrawText(Lines[LineIndex], Color, SafeX, Y, bResultLine ? MediumFont : SmallFont, bResultLine ? 1.0f : 1.15f, false);
		Y += bResultLine ? 27.0f : 22.0f;
	}
}

void ADaesseuyoMvpHud::EnsureGeneratedAssetsLoaded()
{
	if (bTriedLoadingGeneratedAssets)
	{
		return;
	}

	bTriedLoadingGeneratedAssets = true;
	StadiumTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/stadium_batting_view.png"));
	if (!StadiumTexture)
	{
		StadiumTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/plate_view_cinematic.png"));
	}
	BatterCutoutTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/Cutouts/batter_cutout.png"));
	PitcherCutoutTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/Cutouts/pitcher_cutout.png"));
	CatcherCutoutTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/Cutouts/catcher_cutout.png"));
	BaseballTexture = LoadTextureFromProjectFile(TEXT("Content/Daesseuyo/Generated/Images/Cutouts/baseball_cutout.png"));
}

UTexture2D* ADaesseuyoMvpHud::LoadTextureFromProjectFile(const FString& RelativePath) const
{
	const FString FullPath = FPaths::ConvertRelativePathToFull(FPaths::ProjectDir() / RelativePath);

	TArray<uint8> CompressedData;
	if (!FFileHelper::LoadFileToArray(CompressedData, *FullPath))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo HUD could not load generated image: %s"), *FullPath);
		return nullptr;
	}

	IImageWrapperModule& ImageWrapperModule = FModuleManager::LoadModuleChecked<IImageWrapperModule>(TEXT("ImageWrapper"));
	const EImageFormat DetectedFormat = ImageWrapperModule.DetectImageFormat(CompressedData.GetData(), CompressedData.Num());
	if (DetectedFormat == EImageFormat::Invalid)
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo HUD image format is invalid: %s"), *FullPath);
		return nullptr;
	}

	const TSharedPtr<IImageWrapper> ImageWrapper = ImageWrapperModule.CreateImageWrapper(DetectedFormat);
	if (!ImageWrapper.IsValid() || !ImageWrapper->SetCompressed(CompressedData.GetData(), CompressedData.Num()))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo HUD could not decode generated image: %s"), *FullPath);
		return nullptr;
	}

	TArray<uint8> RawData;
	if (!ImageWrapper->GetRaw(ERGBFormat::BGRA, 8, RawData))
	{
		UE_LOG(LogTemp, Warning, TEXT("Daesseuyo HUD could not convert generated image pixels: %s"), *FullPath);
		return nullptr;
	}

	UTexture2D* Texture = UTexture2D::CreateTransient(ImageWrapper->GetWidth(), ImageWrapper->GetHeight(), PF_B8G8R8A8);
	if (!Texture)
	{
		return nullptr;
	}

	Texture->SRGB = true;
	void* TextureData = Texture->GetPlatformData()->Mips[0].BulkData.Lock(LOCK_READ_WRITE);
	FMemory::Memcpy(TextureData, RawData.GetData(), RawData.Num());
	Texture->GetPlatformData()->Mips[0].BulkData.Unlock();
	Texture->UpdateResource();
	return Texture;
}

void ADaesseuyoMvpHud::DrawGeneratedAtBatLayer(const ADaesseuyoMvpPawn* MvpPawn)
{
	EnsureGeneratedAssetsLoaded();

	if (!Canvas)
	{
		return;
	}

	const float W = Canvas->ClipX;
	const float H = Canvas->ClipY;

	if (StadiumTexture)
	{
		DrawTexture(StadiumTexture, FVector2D::ZeroVector, FVector2D(W, H));
	}

	auto DrawByHeight = [this](UTexture2D* Texture, const FVector2D& Position, const float Height, const FLinearColor& Color = FLinearColor::White)
	{
		if (!Texture || Texture->GetSizeY() <= 0)
		{
			return;
		}

		const float Width = Height * (static_cast<float>(Texture->GetSizeX()) / static_cast<float>(Texture->GetSizeY()));
		DrawTexture(Texture, Position, FVector2D(Width, Height), Color);
	};

	DrawByHeight(PitcherCutoutTexture, FVector2D(W * 0.505f - H * 0.095f, H * 0.335f), H * 0.27f, FLinearColor(0.82f, 0.9f, 1.0f, 0.92f));
	DrawByHeight(CatcherCutoutTexture, FVector2D(W * 0.018f, H * 0.455f), H * 0.49f, FLinearColor(1.0f, 1.0f, 1.0f, 0.96f));
	DrawByHeight(BatterCutoutTexture, FVector2D(W * 0.725f, H * 0.205f), H * 0.76f, FLinearColor(1.0f, 1.0f, 1.0f, 0.98f));

	if (!MvpPawn)
	{
		return;
	}

	const FVector2D AimPoint = ProjectPitchPointToHud(MvpPawn->GetAimPoint());
	const FLinearColor AimColor(1.0f, 0.78f, 0.10f, 0.88f);
	DrawRect(AimColor, AimPoint.X - 24.0f, AimPoint.Y - 1.5f, 48.0f, 3.0f);
	DrawRect(AimColor, AimPoint.X - 1.5f, AimPoint.Y - 24.0f, 3.0f, 48.0f);
	DrawRect(FLinearColor(1.0f, 0.78f, 0.10f, 0.22f), AimPoint.X - 17.0f, AimPoint.Y - 17.0f, 34.0f, 34.0f);

	if (BaseballTexture && MvpPawn->ShouldRenderBallForHud())
	{
		const FVector BallPosition = MvpPawn->GetBallPosition();
		const float PitchProgress = FMath::Clamp((1800.0f - BallPosition.X) / (1800.0f - 90.0f), 0.0f, 1.0f);
		const float BallSize = MvpPawn->GetPlayPhase() == EMvpPlayPhase::Pitching
			? FMath::Lerp(18.0f, 56.0f, PitchProgress)
			: 34.0f;
		const FVector2D BallPoint = ProjectPitchPointToHud(BallPosition);
		DrawTexture(BaseballTexture, BallPoint - FVector2D(BallSize * 0.5f, BallSize * 0.5f), FVector2D(BallSize, BallSize));
	}
}

void ADaesseuyoMvpHud::DrawTexture(UTexture2D* Texture, const FVector2D& Position, const FVector2D& Size, const FLinearColor& Color) const
{
	if (!Canvas || !Texture || !Texture->GetResource())
	{
		return;
	}

	FCanvasTileItem Tile(Position, Texture->GetResource(), Size, Color);
	Tile.BlendMode = SE_BLEND_Translucent;
	Canvas->DrawItem(Tile);
}

FVector2D ADaesseuyoMvpHud::ProjectPitchPointToHud(const FVector& WorldPosition) const
{
	if (!Canvas)
	{
		return FVector2D::ZeroVector;
	}

	const float W = Canvas->ClipX;
	const float H = Canvas->ClipY;

	if (WorldPosition.X > 1900.0f)
	{
		const float FlightProgress = FMath::Clamp((WorldPosition.X - 90.0f) / 8100.0f, 0.0f, 1.0f);
		return FVector2D(
			W * 0.52f + WorldPosition.Y * 0.055f,
			H * 0.74f - FlightProgress * H * 0.48f - WorldPosition.Z * 0.055f
		);
	}

	const float PitchProgress = FMath::Clamp((1800.0f - WorldPosition.X) / (1800.0f - 90.0f), 0.0f, 1.0f);
	return FVector2D(
		W * 0.505f + WorldPosition.Y * 1.35f,
		FMath::Lerp(H * 0.425f, H * 0.735f, PitchProgress) - (WorldPosition.Z - 130.0f) * 0.30f
	);
}
